import { create } from 'zustand';

export interface AppNotification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: Date;
    read: boolean; // Indica si la notificación ha sido leída
}

interface NotificationStore {
    notifications: AppNotification[];
    addNotification: (type: AppNotification['type'], message: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
    getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],

    // Agrega la notificación al historial (sin auto-borrado)
    addNotification: (type, message) => {
        const newNotification: AppNotification = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        message,
        timestamp: new Date(),
        read: false,
        };
        
        set((state) => ({
        // Guardamos un máximo de 20 notificaciones en el historial
        notifications: [newNotification, ...state.notifications].slice(0, 20)
        }));
    },

    // Marca una sola como leída al hacerle clic
    markAsRead: (id) => {
        set((state) => ({
        notifications: state.notifications.map((n) => 
            n.id === id ? { ...n, read: true } : n
        )
        }));
    },

    // Marca todas como leídas (el típico botón "Marcar todo como leído")
    markAllAsRead: () => {
        set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
        }));
    },

    // Limpia la bandeja
    clearNotifications: () => {
        set({ notifications: [] });
    },

    // Utilidad para saber qué número poner en la campanita
    getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length;
    }
}));