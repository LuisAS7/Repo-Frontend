import { create } from 'zustand';
import { authService } from '../services/authService';
import type { User, UserRole } from '../types/auth';
import type { CurrentUser } from '../types/api.types';
import { useNotificationStore } from './useNotificationStore';

interface AuthState {
    user: User | null;
    isLoading: boolean; // Para verificar si estamos validando el token al recargar la página
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>; // Función que se ejecuta al recargar la página
}

// Función para mapear el usuario del backend al formato que usamos en el frontend
const mapBackUserToFrontUser = (backendUser: CurrentUser): User => {
    return {
        id: backendUser.id,
        email: backendUser.email,
        role: backendUser.role.toLowerCase() as UserRole, // Aseguramos compatibilidad (ej: 'ADMIN' -> 'admin')
        name: `${backendUser.first_name} ${backendUser.last_name}`, // Concatenamos el nombre
    };
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true, // Valor true al inicio para que la app sepa que estamos validando el token

    login: async (email, password) => {
        // El authService hace el POST y guarda el token en localStorage
        await authService.login(email, password);
        // Obtenemos el perfil real desde FastAPI
        const currentUser = await authService.getMe();
        const user = mapBackUserToFrontUser(currentUser);
        set({ user });
    },

    logout: () => {
        authService.logout();
        set({ user: null, isLoading: false });
        useNotificationStore.getState().clearNotifications(); // Limpiamos las notificaciones al cerrar sesión
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            // Si hay un token en localStorage, intentamos obtener el usuario
            if (authService.isAuthenticated()) {
                const currentUser = await authService.getMe();
                const user = mapBackUserToFrontUser(currentUser);
                set({ user, isLoading: false });
            } else {
                set({ user: null, isLoading: false });
            }
            } catch (error) {
            // Si el token expiró o es inválido, el backend dará error
            // Limpiamos el rastro y deslogueamos
            authService.logout();
            useNotificationStore.getState().clearNotifications();
            set({ user: null, isLoading: false });
        }
    }
}));