import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../context/useAuthStore';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
    allowedRoles: UserRole[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const {user, isLoading} = useAuthStore();

    // Estado de carga mientras se valida el token
    if (isLoading) {
        return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-gray-500 font-medium animate-pulse">Verificando sesión...</div>
        </div>
        );
    }

    // Si no hay usuario, expulsar al login
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Si el usuario existe pero no tiene el rol adecuado, bloquear acceso
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Si todo está OK se renderiza la pantalla solicitada
    return <Outlet />;
};