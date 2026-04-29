import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '../types/auth'

interface Props {
  user: User
  onLogout: () => void
}

interface Patient {
  id: number
  name: string
  dni: string
  phone: string
}

const MOCK_PATIENTS: Patient[] = [
  { id: 1, name: 'Ana Martínez',    dni: '11223344-5', phone: '+34 600 111 222' },
  { id: 2, name: 'Roberto Gómez',   dni: '55667788-9', phone: '+34 600 333 444' },
  { id: 3, name: 'Laura Sánchez',   dni: '99887766-5', phone: '+34 600 555 666' },
  { id: 4, name: 'Carlos Mendoza',  dni: '12345678-9', phone: '+34 600 777 888' },
  { id: 5, name: 'María González',  dni: '98765432-1', phone: '+34 600 999 000' },
]

export default function ReceptionDirectoryPage({ user, onLogout }: Props) {
  const [query, setQuery] = useState('')

  const filtered = MOCK_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.dni.includes(query)
  )

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar — mismo que ReceptionPage */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C9.79 2 8 3.79 8 6s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" fill="#22d3ee"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">ValSync</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            to="/reception"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Agenda Diaria
          </Link>
          <Link
            to="/reception/directory"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-medium text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Directorio de Pacientes
          </Link>
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 text-sm transition cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">Recepción</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Directorio de Pacientes</h1>
            <p className="text-sm text-gray-500 mt-0.5">Busque pacientes existentes para programar nuevas citas médicas.</p>
          </div>

          {/* Buscador */}
          <div className="relative mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre o DNI/Documento..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Lista de pacientes */}
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">
                No se encontraron pacientes con ese criterio.
              </div>
            ) : (
              filtered.map(patient => (
                <div key={patient.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold">
                      {getInitials(patient.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{patient.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          DNI: {patient.dni}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.72 6.72l1.06-1.06a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          {patient.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 text-xs font-semibold rounded-xl hover:bg-blue-50 transition cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Programar Cita
                  </button>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}