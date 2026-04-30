import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import type { User } from './types/auth'

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  if (!user) return <LoginPage onLogin={setUser} />

  const getDefaultRoute = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "/admin"
      case "receptionist":
        return "/reception"
      case "doctor":
        return "/doctor/agenda"
      case "nurse":
        return "/nurse"
      default:
        return "/unauthorized"
    }
  }

  // Uncomment if you want to bypass the router for doctors
  // if (user.role === 'doctor') {
  //   return <DoctorDashboard user={user} onLogout={() => setUser(null)} />
  // }
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige la raíz según el rol */}
        <Route 
          path="/" 
          element={<Navigate to={getDefaultRoute(user.role)} replace />} 
        />

        {/* Rutas de ADMIN */}
        <Route
          path="/admin"
          element={<Layout user={user} onLogout={() => setUser(null)} />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="calendar" element={<CalendarPage />} />
        </Route>
        {/* Rutas de DOCTOR */}
        <Route 
          path="/doctor" 
          element={<Layout user={user} onLogout={() => setUser(null)} />}
        >
          <Route path="agenda" element={<DoctorAgenda />} />
          <Route path="consultation/:id" element={<Consultation />} />
        </Route>
        {/* Rutas de ENFERMERA */}
        <Route 
          path="/nurse" 
          element={<Layout user={user} onLogout={() => setUser(null)} />} 
        >
          <Route index element={<NurseDashboard />} />
        </Route>
        {/* Rutas de RECEPCION */}
        <Route 
          path="/reception" 
          element={<Layout user={user} onLogout={() => setUser(null)} />} 
        >
          <Route index element={<ReceptionPage />} />
          <Route path="directory" element={<ReceptionDirectoryPage />} />
        </Route>

        {/* Rutas de BLOQUEO */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Fallback */}
        <Route 
          path="*" 
          element={<Navigate to={getDefaultRoute(user.role)} replace />} 
        />
      </Routes>
    </BrowserRouter>
  )
}