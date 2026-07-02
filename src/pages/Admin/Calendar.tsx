import { useState,useEffect, useMemo } from "react";
import { Search, Calendar as CalendarIcon, Filter, Clock, Activity } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { appointmentService } from "../../services/appointmentService";
import { patientService } from "../../services/patientService";
import { staffService } from "../../services/staffService";
import type { AppointmentResponse, PatientResponse, StaffResponse } from "../../types/reception";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "SCHEDULED":  return <Badge variant="default">Programada</Badge>;
    case "WAITING":    return <Badge variant="warning">En Espera</Badge>;
    case "READY":      return <Badge variant="success">Listo para Consulta</Badge>;
    case "COMPLETED":  return <Badge variant="success">Completada</Badge>;
    case "CANCELLED":  return <Badge variant="danger">Cancelada</Badge>;
    default:           return <Badge variant="neutral">{status}</Badge>;
  }
};

export function CalendarPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [patients, setPatients]         = useState<Map<string, PatientResponse>>(new Map())
  const [staff, setStaff]               = useState<StaffResponse[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)

  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas las especialidades")
  const [selectedDoctor, setSelectedDoctor]       = useState("Todos los médicos")
  const [searchTerm, setSearchTerm]               = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const [appts, pats, staffData] = await Promise.all([
          appointmentService.getAll(),
          patientService.getAll(),
          staffService.getAll(),
        ])
        setAppointments(appts)
        setPatients(new Map(pats.map(p => [p.id, p])))
        setStaff(staffData.filter(s => s.role === "DOCTOR" && s.is_active))
      } catch (err: any) {
        setError(err.message ?? "Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getDoctorById = (doctorId: string | null) => {
    if (!doctorId) return null
    return staff.find(s => s.id === doctorId) ?? null
  }

  const getPatientName = (patientId: string) => {
    const p = patients.get(patientId)
    return p ? `${p.first_name} ${p.last_name}` : "Cargando..."
  }

  const specialties = useMemo(() => {
    const unique = new Set(staff.map(s => s.doctor_profile?.specialty.name).filter(Boolean) as string[])
    return ["Todas las especialidades", ...Array.from(unique)]
  }, [staff])

  const doctors = useMemo(() => {
    return ["Todos los médicos", ...staff.map(s => `${s.first_name} ${s.last_name}`)]
  }, [staff])

  const filteredSchedule = useMemo(() => {
    return appointments.filter(item => {
      const doctor = getDoctorById(item.doctor_id)
      const doctorName = doctor ? `${doctor.first_name} ${doctor.last_name}` : ""
      const specialty = doctor?.doctor_profile?.specialty.name ?? "Sin Asignar"

      const matchSpecialty = selectedSpecialty === "Todas las especialidades" || specialty === selectedSpecialty
      const matchDoctor    = selectedDoctor === "Todos los médicos" || doctorName === selectedDoctor

      const patientName = getPatientName(item.patient_id).toLowerCase()
      const matchSearch  = patientName.includes(searchTerm.toLowerCase())

      return matchSpecialty && matchDoctor && matchSearch
    })
  }, [appointments, selectedSpecialty, selectedDoctor, searchTerm, staff, patients])

  const summary = useMemo(() => {
    const counts: Record<string, number> = {}
    appointments.forEach(item => {
      const doctor = getDoctorById(item.doctor_id)
      const specialty = doctor?.doctor_profile?.specialty.name ?? "Sin Asignar"
      counts[specialty] = (counts[specialty] || 0) + 1
    })
    return counts
  }, [appointments, staff])

  if (loading) return <div className="p-12 text-center text-slate-400">Cargando agenda...</div>
  if (error)   return <div className="p-12 text-center text-red-500">{error}</div>

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Supervisión de Agenda General</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Supervisión clínica de todas las citas y especialidades.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Object.entries(summary).map(([spec, count]) => (
          <Card key={spec} className="p-4 flex flex-col bg-white dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{spec}</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
              {count} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">citas</span>
            </span>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="shrink-0 bg-white dark:bg-slate-900">
        <div className="p-5 flex flex-col lg:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg m-1 border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 md:w-60">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <select
                value={selectedSpecialty}
                onChange={e => setSelectedSpecialty(e.target.value)}
                className="pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
              >
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="relative flex-1 md:w-60">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <select
                value={selectedDoctor}
                onChange={e => setSelectedDoctor(e.target.value)}
                className="pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
              >
                {doctors.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </Card>

      {/* Schedule List */}
      <Card className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-900">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Horario General
          </h2>
          <span className="text-xs font-medium text-slate-500">Mostrando {filteredSchedule.length} citas</span>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          {filteredSchedule.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No se encontraron citas con los filtros seleccionados.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSchedule.map(item => {
                const doctor = getDoctorById(item.doctor_id)
                const doctorName = doctor ? `${doctor.first_name} ${doctor.last_name}` : "Sin asignar"
                const docInitials = doctorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                const specialty = doctor?.doctor_profile?.specialty.name ?? "Sin Asignar"

                return (
                  <div key={item.id} className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2 w-32 shrink-0 text-slate-600 dark:text-slate-400 font-medium">
                      <Clock className="size-4 text-slate-400" />
                      {item.scheduled_time.slice(0, 5)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {getPatientName(item.patient_id)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{specialty}</p>
                    </div>

                    <div className="flex items-center gap-2 w-48 shrink-0">
                      <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                        {docInitials}
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-300 truncate font-medium">{doctorName}</span>
                    </div>

                    <div className="w-28 shrink-0 text-right sm:text-left">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}