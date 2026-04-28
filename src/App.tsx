import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ReceptionPage from './pages/ReceptionPage'
import ReceptionDirectoryPage from './pages/ReceptionDirectoryPage'
import type { User } from './types/auth'

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  if (!user) return <LoginPage onLogin={setUser} />

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige la raíz según el rol */}
        <Route path="/" element={<Navigate to="/reception" replace />} />

        {/* Rutas de recepción */}
        <Route path="/reception" element={<ReceptionPage user={user} onLogout={() => setUser(null)} />} />
        <Route path="/reception/directory" element={<ReceptionDirectoryPage user={user} onLogout={() => setUser(null)} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/reception" replace />} />
      </Routes>
    </BrowserRouter>
  )
}