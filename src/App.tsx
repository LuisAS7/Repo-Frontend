import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './context/useAuthStore'
import type { UserRole } from './types/auth'

// Importación de páginas
import LoginPage from './pages/LoginPage'
import { Dashboard as AdminDashboard } from './pages/Admin/Dashboard'
import { StaffPage } from './pages/Admin/Staff'
import { CalendarPage } from './pages/Admin/Calendar'
import { DoctorAgenda } from './pages/Doctor/DoctorAgenda'
import { Consultation } from './pages/Doctor/Consultation'
import { NurseDashboard } from './pages/Nurse/NurseDashboard'
import { ReceptionPage } from './pages/Receptionist/ReceptionPage'
import { ReceptionDirectoryPage } from './pages/Receptionist/ReceptionDirectoryPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth/protectedRoute'

export default function App() {
  const { user, isLoading, checkAuth, logout } = useAuthStore()

  // Estado local para manejar el usuario en el componente principal
  useEffect(() => {
    // Al cargar la app, verificamos si hay un token válido
    checkAuth();
  }, []);

  const getDefaultRoute = (role?: UserRole) => {
    switch (role) {
      case "admin": return "/admin";
      case "receptionist": return "/reception";
      case "doctor": return "/doctor/agenda";
      case "nurse": return "/nurse";
      default: return "/";
    }
  };

  // Bloqueo de pantalla mientras se valida el token
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#334155',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            borderRadius: '0.75rem',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Ruta Pública */}
        <Route 
          path="/" 
          element={user ? <Navigate to={getDefaultRoute(user.role)} replace /> : <LoginPage />}
        />

        {/* RUTAS PROTEGIDAS - ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Layout user={user!} onLogout={logout} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Route>

        {/* RUTAS PROTEGIDAS - DOCTOR */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route path="/doctor" element={<Layout user={user!} onLogout={logout} />}>
            <Route path="agenda" element={<DoctorAgenda />} />
            <Route path="consultation/:id" element={<Consultation />} />
          </Route>
        </Route>

        {/* RUTAS PROTEGIDAS - ENFERMERA */}
        <Route element={<ProtectedRoute allowedRoles={['nurse']} />}>
          <Route path="/nurse" element={<Layout user={user!} onLogout={logout} />}>
            <Route index element={<NurseDashboard />} />
          </Route>
        </Route>

        {/* RUTAS PROTEGIDAS - RECEPCIÓN */}
        <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
          <Route path="/reception" element={<Layout user={user!} onLogout={logout} />}>
            <Route index element={<ReceptionPage />} />
            <Route path="directory" element={<ReceptionDirectoryPage />} />
          </Route>
        </Route>

        {/* RUTAS DE ERROR Y FALLBACK */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to={user ? getDefaultRoute(user.role) : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}