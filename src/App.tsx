import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import { Dashboard as AdminDashboard } from './pages/Admin/Dashboard'
import { StaffPage } from './pages/Admin/Staff'
import { CalendarPage } from './pages/Admin/Calendar'
import ReceptionPage from './pages/ReceptionPage'
import ReceptionDirectoryPage from './pages/ReceptionDirectoryPage'
import { Layout } from './components/layout/Layout'
import type { User } from './types/auth'

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  if (!user) return <LoginPage onLogin={setUser} />

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige la raíz según el rol */}
        <Route 
          path="/" 
          element={
            user.role === "admin"
              ? <Navigate to="/admin" replace />
              : <Navigate to="/reception" replace />
          } 
        />

        {/* Rutas de recepción */}
        <Route
          path="/admin"
          element={<Layout user={user} onLogout={() => setUser(null)} />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="calendar" element={<CalendarPage />} />
        </Route>
        <Route path="/reception" element={<ReceptionPage user={user} onLogout={() => setUser(null)} />} />
        <Route path="/reception/directory" element={<ReceptionDirectoryPage user={user} onLogout={() => setUser(null)} />} />

        {/* Fallback */}
        <Route path="*" element={
          user.role === "admin" 
            ? <Navigate to="/admin" replace />
            : <Navigate to="/reception" replace />
          } />
      </Routes>
    </BrowserRouter>
  )
}