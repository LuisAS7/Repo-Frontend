import { useState, useEffect } from "react"
import { UserPlus, UserCheck } from "lucide-react"
import {toast} from "react-hot-toast"
import { StatusBadge } from "./components/StatusBadge"
import { FilterBar } from "./components/FilterBar"
import { WalkInModal } from "./components/WalkInModal"
import { appointmentService } from "../../services/appointmentService"
import { patientService } from "../../services/patientService"
import type { AppointmentResponse, PatientResponse, StaffResponse } from "../../types/reception"
import { apiClient } from "../../services/apiClient"
import { t } from "../../utils/translations"
import { useNotificationStore } from "../../context/useNotificationStore"

export function ReceptionPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [patients, setPatients] = useState<Map<string, PatientResponse>>(new Map())
  const [doctors, setDoctors] = useState<StaffResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterDoctor, setFilterDoctor] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("")
  const [isWalkInOpen, setIsWalkInOpen] = useState(false)

  const { addNotification } = useNotificationStore()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [appts, pats, staff] = await Promise.all([
          appointmentService.getAll(),
          patientService.getAll(),
          apiClient.get<StaffResponse[]>("/staff/"),
        ])
        setAppointments(appts)
        setPatients(new Map(pats.map(p => [p.id, p])))
        setDoctors(staff.filter(s => s.role === "DOCTOR" && s.is_active))
      } catch (err: any) {
        const message = t.error(err.response?.data?.detail) || err.message || "Error al cargar datos"
        setError(message)
        toast.error(message)
        addNotification("error", message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const specialtiesList = Array.from(
    new Set(doctors.map(d => d.doctor_profile?.specialty.name).filter(Boolean))
  ) as string[]

  const doctorsData = doctors.map(d => ({
    id: d.id,
    name: `${d.first_name} ${d.last_name}`,
    specialty: t.catalog(d.doctor_profile?.specialty.name ?? ""),
  }))

  const getDoctorName = (doctorId: string | null) => {
    if (!doctorId) return "Sin asignar"
    const doc = doctorsData.find(d => d.id === doctorId)
    return doc ? doc.name : "Doctor desconocido"
  }

  const filteredQueue = appointments.filter(item => {
    const doctorName = getDoctorName(item.doctor_id)
    const matchDoctor = filterDoctor === "" || doctorName === filterDoctor
    const matchSpecialty = filterSpecialty === "" ||
      doctorsData.find(d => d.name === doctorName)?.specialty === filterSpecialty
    return matchDoctor && matchSpecialty
  })

  const handleMarkArrived = (id: string) => {
    // Actualización optimista en UI
    // Si el back agrega PATCH /appointments/{id}/status, agrégalo aquí
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: "WAITING" } : a)
    )
    toast.success("Paciente marcado como llegado")
    addNotification("success", "Paciente marcado como llegado")
  }

  const handleCancel = async (id: string) => {
    try {
      await appointmentService.cancel(id, "Cancelado desde recepción")
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status: "CANCELLED" } : a)
      )
      toast.success("Cita cancelada correctamente")
      addNotification("success", "Cita cancelada correctamente")
    } catch (err: any) {
      const message = t.error(err.response?.data?.detail) || err.message || "Error al cancelar la cita"
      toast.error(message)
      addNotification("error", message)
    }
  }

  const handleWalkIn = async ({
    dni, firstName, lastName, birthDate, phone,
  }: {
    dni: string; firstName: string; lastName: string; birthDate: string; phone: string
  }) => {
    try {
      // 1. Registrar paciente
      const newPatient = await patientService.create({
        document_number: dni,
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        phone,
      })

      // 2. Crear walk-in con el nuevo endpoint
      const today = new Date().toISOString().split("T")[0]
      const newAppt = await apiClient.post<AppointmentResponse>("/appointments/walk-in", {
        patient_id: newPatient.id,
        scheduled_date: today,
        reason: "Atención de urgencia / Ingreso rápido",
      })

      setAppointments(prev => [...prev, newAppt])
      setPatients(prev => new Map(prev).set(newPatient.id, newPatient))
      setIsWalkInOpen(false)
      toast.success("Walk-in registrado correctamente")
      addNotification("success", "Walk-in registrado correctamente")
    } catch (err: any) {
      const message = t.error(err.response?.data?.detail) || err.message || "Error al registrar el walk-in"
      toast.error(message)
      addNotification("error", message)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agenda Diaria (Recepción)</h1>
          <p className="text-slate-500 mt-1">Gestión de pacientes programados y atenciones de urgencia.</p>
        </div>
        <button onClick={() => setIsWalkInOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <UserPlus className="size-5" />
          Ingreso Rápido (Walk-in)
        </button>
      </div>

      <FilterBar
        doctorsData={doctorsData}
        specialtiesList={specialtiesList}
        filterDoctor={filterDoctor}
        filterSpecialty={filterSpecialty}
        onSpecialtyChange={v => { setFilterSpecialty(v); setFilterDoctor("") }}
        onDoctorChange={setFilterDoctor}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando citas...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No hay citas para mostrar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Hora</th>
                  <th className="px-6 py-4 font-medium">Paciente</th>
                  <th className="px-6 py-4 font-medium">Médico Asignado</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center">
                {filteredQueue.map(item => {
                  const patient = patients.get(item.patient_id)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {item.scheduled_time.slice(0, 5)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {patient
                          ? `${patient.first_name} ${patient.last_name}`
                          : "Cargando..."}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {getDoctorName(item.doctor_id)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4">
                        {item.status === "SCHEDULED" && (
                          <button onClick={() => handleMarkArrived(item.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 font-medium rounded-lg border border-green-200">
                            <UserCheck className="w-4 h-4" /> Marcar Llegada
                          </button>
                        )}
                        {item.status === "WAITING" && (
                          <button onClick={() => handleCancel(item.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-medium rounded-lg border border-red-200">
                            Cancelar
                          </button>
                        )}
                        {["CANCELLED", "COMPLETED", "READY"].includes(item.status) && (
                          <span className="text-slate-400 italic text-xs">Sin acciones</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WalkInModal
        open={isWalkInOpen}
        onOpenChange={setIsWalkInOpen}
        onSubmit={handleWalkIn}
      />
    </div>
  )
}