import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import NurseDashboard from './pages/NurseDashboard'
import type { User } from './types/auth'

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  if (!user) return <LoginPage onLogin={setUser} />

  if (user.role === 'nurse')
    return <NurseDashboard user={user} onLogout={() => setUser(null)} /> 

  // Placeholder para los demás roles
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-800">Bienvenido, {user.name} 👋</p>
        <p className="text-gray-500 mt-1 text-sm">Rol: {user.role}</p>
        <button
          onClick={() => setUser(null)}
          className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}