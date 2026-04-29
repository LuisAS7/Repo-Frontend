import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { User } from '../types/auth'

interface Props {
  user: User
  onLogout: () => void
}

type AppointmentStatus = 'Programada' | 'En Sala de Espera' | 'Cancelada' | 'Atendida'

interface Appointment {
  id: number
  time: string
  patient: string
  doctor: string
  status: AppointmentStatus
}

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 1, time: '08:30 AM', patient: 'Carlos Mendoza',  doctor: 'Dr. Torres',  status: 'Programada' },
  { id: 2, time: '09:15 AM', patient: 'María González',  doctor: 'Dra. Ruiz',   status: 'En Sala de Espera' },
  { id: 3, time: '10:00 AM', patient: 'Juan Pérez',      doctor: 'Dr. Torres',  status: 'Cancelada' },
  { id: 4, time: '10:45 AM', patient: 'Lucía Fernández', doctor: 'Dra. Ruiz',   status: 'Atendida' },
  { id: 5, time: '11:30 AM', patient: 'Pedro Ramírez',   doctor: 'Dr. Torres',  status: 'Programada' },
]

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  'Programada':       'bg-blue-50 text-blue-600 border border-blue-200',
  'En Sala de Espera':'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'Cancelada':        'bg-red-50 text-red-500 border border-red-200',
  'Atendida':         'bg-green-50 text-green-600 border border-green-200',
}

const STATUS_DOT: Record<AppointmentStatus, string> = {
  'Programada':       'bg-blue-400',
  'En Sala de Espera':'bg-yellow-400',
  'Cancelada':        'bg-red-400',
  'Atendida':         'bg-green-400',
}

export default function ReceptionPage({ user, onLogout }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS)
  const navigate = useNavigate()

  const handleWalkIn = () => {
    const name = prompt('Nombre del paciente (Walk-in):')
    if (!name?.trim()) return
    const newAppt: Appointment = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      patient: name.trim(),
      doctor: 'Por asignar',
      status: 'En Sala de Espera',
    }
    setAppointments(prev => [newAppt, ...prev])
  }

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
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

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            to="/reception"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-medium text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Agenda Diaria
          </Link>
          <Link
            to="/reception/directory"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Directorio de Pacientes
          </Link>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={() => {
              navigate('/');
              onLogout();
            }}
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
            {/* Notificaciones */}
            <button className="relative p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {/* Usuario */}
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
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agenda Diaria (Recepción)</h1>
              <p className="text-sm text-gray-500 mt-0.5">Gestión de pacientes programados y atenciones de urgencia.</p>
            </div>
            <button
              onClick={handleWalkIn}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Ingreso Rápido (Walk-in)
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Médico Asignado</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map(appt => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{appt.time}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{appt.patient}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{appt.doctor}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[appt.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[appt.status]}`} />
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}