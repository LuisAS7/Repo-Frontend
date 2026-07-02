import { useState, useEffect } from "react";
import { Calendar, Users, XCircle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
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

export function Dashboard() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [patients, setPatients]         = useState<Map<string, PatientResponse>>(new Map())
  const [doctors, setDoctors]           = useState<Map<string, StaffResponse>>(new Map())
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [appts, pats, staff] = await Promise.all([
          appointmentService.getAll(),
          patientService.getAll(),
          staffService.getAll(),
        ])
        setAppointments(appts)
        setPatients(new Map(pats.map(p => [p.id, p])))
        setDoctors(new Map(staff.map(s => [s.id, s])))
      } catch (err: any) {
        setError(err.message ?? "Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalAppointments   = appointments.length
  const waitingPatients     = appointments.filter(a => a.status === "WAITING" || a.status === "READY").length
  const canceledAppointments = appointments.filter(a => a.status === "CANCELLED").length
  const recentAppointments  = [...appointments].slice(0, 5)

  const getPatientName = (patientId: string) => {
    const p = patients.get(patientId)
    return p ? `${p.first_name} ${p.last_name}` : "Cargando..."
  }

  const getDoctorName = (doctorId: string | null) => {
    if (!doctorId) return "Sin asignar"
    const d = doctors.get(doctorId)
    return d ? `${d.first_name} ${d.last_name}` : "Doctor desconocido"
  }

  if (loading) return <div className="p-12 text-center text-slate-400">Cargando dashboard...</div>
  if (error)   return <div className="p-12 text-center text-red-500">{error}</div>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Resumen general de la clínica de hoy.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Citas Totales</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalAppointments}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pacientes en Espera</p>
              <h3 className="text-2xl font-bold text-slate-900">{waitingPatients}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <XCircle className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Citas Canceladas</p>
              <h3 className="text-2xl font-bold text-slate-900">{canceledAppointments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Citas Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Paciente</th>
                <th className="px-6 py-3 font-medium">Hora</th>
                <th className="px-6 py-3 font-medium">Médico Asignado</th>
                <th className="px-6 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAppointments.map(apt => (
                <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{getPatientName(apt.patient_id)}</td>
                  <td className="px-6 py-4 text-slate-600">{apt.scheduled_time.slice(0, 5)}</td>
                  <td className="px-6 py-4 text-slate-600">{getDoctorName(apt.doctor_id)}</td>
                  <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}