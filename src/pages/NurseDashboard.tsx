import { useState } from 'react'
import type { User } from '../types/auth'

interface Patient {
  id: string
  name: string
  initials: string
  dni: string
  time: string
  age: number
  bloodType: string
  chronicDiseases?: string[]
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'María González',
    initials: 'MG',
    dni: '12345678-9',
    time: '09:15 AM',
    age: 45,
    bloodType: 'O+',
  },
  {
    id: '2',
    name: 'José Ramírez',
    initials: 'JR',
    dni: '98765432-1',
    time: '09:45 AM',
    age: 62,
    bloodType: 'A-',
    chronicDiseases: ['Hipertensión', 'Diabetes Tipo 2'],
  },
]

interface Props {
  user: User
  onLogout: () => void
}

interface VitalForm {
  weight: string
  height: string
  bloodPressure: string
  temperature: string
}

export default function NurseDashboard({ user, onLogout }: Props) {
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [form, setForm] = useState<VitalForm>({
    weight: '',
    height: '',
    bloodPressure: '',
    temperature: '',
  })

  const bmi = (() => {
    const w = parseFloat(form.weight)
    const h = parseFloat(form.height) / 100
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1)
    return '--'
  })()

  const filtered = MOCK_PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.dni.includes(search)
  )

  const openModal = (patient: Patient) => {
    setSelectedPatient(patient)
    setForm({ weight: '', height: '', bloodPressure: '', temperature: '' })
  }

  const closeModal = () => setSelectedPatient(null)

  const handleSave = () => {
    // TODO: guardar en backend
    closeModal()
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polyline
                points="22 12 18 12 15 21 9 3 6 12 2 12"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-blue-600 font-bold text-lg tracking-tight">ValSync</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polyline
                points="22 12 18 12 15 21 9 3 6 12 2 12"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Fila de Triage
          </button>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm transition cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polyline
                points="16 17 21 12 16 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="21" y1="12" x2="9" y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 gap-5 shrink-0">
          {/* Moon icon */}
          <button className="text-gray-400 hover:text-gray-600 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Bell */}
          <button className="relative text-gray-400 hover:text-gray-600 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
              <p className="text-xs text-gray-400 leading-tight">Enfermería</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fila de Triage</h1>
              <p className="text-sm text-gray-500 mt-1">
                Pacientes en sala de espera listos para toma de signos vitales.
              </p>
            </div>
            <div className="relative shrink-0">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar paciente..."
                className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-60 transition"
              />
            </div>
          </div>

          {/* Patient list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-10">No se encontraron pacientes.</p>
            )}
            {filtered.map((patient, idx) => (
              <div
                key={patient.id}
                className={`flex items-center justify-between px-6 py-5 ${
                  idx < filtered.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm shrink-0">
                    {patient.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
                        En Espera
                      </span>
                      <span className="text-xs text-gray-400">{patient.time}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-400">DNI: {patient.dni}</p>
                  </div>
                </div>

                <button
                  onClick={() => openModal(patient)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition cursor-pointer shrink-0"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <polyline
                      points="22 12 18 12 15 21 9 3 6 12 2 12"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Tomar Signos Vitales
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* ── Modal ── */}
      {selectedPatient && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Evaluación de Triage</h2>
                <p className="text-sm text-gray-500 mt-0.5">Registre los signos vitales del paciente.</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition mt-1 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4">

              {/* Patient info card */}
              <div className="border border-gray-200 rounded-xl px-4 py-3">
                <p className="font-bold text-gray-900">{selectedPatient.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Edad: {selectedPatient.age} años | Tipo de sangre:{' '}
                  <span className="text-red-600 font-semibold">{selectedPatient.bloodType}</span>
                </p>
              </div>

              {/* Chronic diseases warning */}
              {selectedPatient.chronicDiseases && selectedPatient.chronicDiseases.length > 0 && (
                <div className="flex items-start gap-2.5 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="shrink-0 mt-0.5"
                  >
                    <path
                      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                      stroke="#ca8a04"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line x1="12" y1="9" x2="12" y2="13" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="17" x2="12.01" y2="17" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm text-red-600 font-medium">
                    Enfermedades crónicas: {selectedPatient.chronicDiseases.join(', ')}
                  </p>
                </div>
              )}

              {/* Form grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Presión Arterial
                  </label>
                  <input
                    type="text"
                    value={form.bloodPressure}
                    onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })}
                    placeholder="120/80"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.temperature}
                    onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* BMI */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-sm text-gray-600">Índice de Masa Corporal (IMC)</span>
                <span className="text-sm font-bold text-gray-800">{bmi}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-semibold transition cursor-pointer"
                >
                  Guardar y Enviar al Médico
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}