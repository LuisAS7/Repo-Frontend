import { useState, useEffect } from "react";
import { Calendar, Users, XCircle, Activity } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge"; // Importamos tu componente global
import { appointmentService } from "../../services/appointmentService";
import { patientService } from "../../services/patientService";
import { staffService } from "../../services/staffService";
import { toast } from "react-hot-toast";
import { useNotificationStore } from "../../context/useNotificationStore";
import { t } from "../../utils/translations";
import type { AppointmentResponse, PatientResponse, StaffResponse } from "../../types/reception";

export function Dashboard() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [patients, setPatients]         = useState<Map<string, PatientResponse>>(new Map());
  const [doctors, setDoctors]           = useState<Map<string, StaffResponse>>(new Map());
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const load = async () => {
      try {
        const [appts, pats, staff] = await Promise.all([
          appointmentService.getAll(),
          patientService.getAll(),
          staffService.getAll(),
        ]);
        setAppointments(appts);
        setPatients(new Map(pats.map(p => [p.id, p])));
        setDoctors(new Map(staff.map(s => [s.id, s])));
      } catch (err: any) {
        const message = t.error(err.response?.data?.detail) || err.message || "Error al cargar datos";
        setError(message);
        toast.error(message);
        addNotification("error", message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addNotification]);

  // Cálculos de métricas
  const totalAppointments    = appointments.length;
  const waitingPatients      = appointments.filter(a => a.status === "WAITING" || a.status === "READY").length;
  const canceledAppointments = appointments.filter(a => a.status === "CANCELLED").length;
  const recentAppointments   = [...appointments].slice(0, 5); // Las 5 citas más recientes

  const getPatientName = (patientId: string) => {
    const p = patients.get(patientId);
    return p ? `${p.first_name} ${p.last_name}` : "Cargando...";
  };

  const getDoctorName = (doctorId: string | null) => {
    if (!doctorId) return "Sin asignar";
    const d = doctors.get(doctorId);
    return d ? `${d.first_name} ${d.last_name}` : "Doctor desconocido";
  };

  // Estados de carga y error mejorados
  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-400 dark:text-slate-500 animate-pulse">
      <Activity className="w-8 h-8 mb-4" />
      <p className="font-medium">Cargando métricas del dashboard...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-12 text-center text-red-500 dark:text-red-400 font-medium">
      {error}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Usamos tu componente PageHeader */}
      <PageHeader 
        title="Dashboard Central" 
        subtitle="Resumen operativo general de la clínica el día de hoy." 
      />

      {/* Tarjetas de Métricas (Con soporte Dark Mode) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl transition-colors">
              <Calendar className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Citas Totales</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalAppointments}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl transition-colors">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pacientes en Espera</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{waitingPatients}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl transition-colors">
              <XCircle className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Citas Canceladas</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{canceledAppointments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Citas Recientes */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Citas Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Paciente</th>
                <th className="px-6 py-4 font-medium">Hora programada</th>
                <th className="px-6 py-4 font-medium">Médico Asignado</th>
                <th className="px-6 py-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {recentAppointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No hay citas registradas recientemente.
                  </td>
                </tr>
              ) : (
                recentAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {getPatientName(apt.patient_id)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {apt.scheduled_time.slice(0, 5)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {getDoctorName(apt.doctor_id)}
                    </td>
                    <td className="px-6 py-4">
                      {/* Usamos el componente StatusBadge global */}
                      <StatusBadge status={apt.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}