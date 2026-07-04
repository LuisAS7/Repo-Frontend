import { useState, useEffect, useRef } from "react";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, User, FileText, ArrowRight, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../context/useAuthStore";
import { appointmentService } from "../../services/appointmentService";
import { patientService } from "../../services/patientService";
import { t } from "../../utils/translations"
import { toast } from "react-hot-toast"
import { useNotificationStore } from "../../context/useNotificationStore";
import type { AppointmentResponse, PatientResponse } from "../../types/reception";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function DoctorAgenda() {
  const [currentDate, setCurrentDate]   = useState(new Date())
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [patients, setPatients]         = useState<Map<string, PatientResponse>>(new Map())
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const navigate = useNavigate()
  const dateInputRef = useRef<HTMLInputElement>(null)

  const user = useAuthStore(state => state.user);
  const { addNotification } = useNotificationStore();
  const doctorName = user?.name ?? "Doctor";
  const doctorId   = user?.id ?? "";

  useEffect(() => {
    if (!doctorId) return;
    const load = async () => {
      try {
        setLoading(true);
        const [appts, pats] = await Promise.all([
          appointmentService.getAll(),
          patientService.getAll(),
        ]);

        const formattedDate = format(currentDate, "yyyy-MM-dd");

        const filtered = appts.filter(a =>
          a.doctor_id === doctorId &&
          a.scheduled_date === formattedDate
        );

        setAppointments(filtered);
        setPatients(new Map(pats.map(p => [p.id, p])));
      } catch (err: any) {
        const message = t.error(err.response?.data?.detail) || err.message || "Error al cargar la agenda"
        setError(message)
        toast.error(message)
        addNotification("error", message)
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentDate, doctorId]);

  const getPatientName = (patientId: string) => {
    const p = patients.get(patientId)
    return p ? `${p.first_name} ${p.last_name}` : "Cargando..."
  }

  const getPatientReason = (appt: AppointmentResponse) => appt.reason ?? "Sin motivo registrado"

  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1))
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1))

  const startConsultation = (appointmentId: string) => {
    const patientName = getPatientName(appointments.find(a => a.id === appointmentId)?.patient_id ?? "")
    const infoMessage = `Iniciando consulta de ${patientName}`
    toast.loading(infoMessage)
    addNotification("info", infoMessage)
    navigate(`/doctor/consultation/${appointmentId}`)
  }

  if (loading) return <div className="p-12 text-center text-slate-400">Cargando agenda...</div>
  if (error)   return <div className="p-12 text-center text-red-500">{error}</div>

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-dark">
            {getGreeting()}, {doctorName}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Tienes{" "}
            <span className="font-semibold text-blue-600">
              {appointments.filter(a => a.status !== "CANCELLED").length} citas
            </span>{" "}
            programadas para hoy.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <button onClick={handlePrevDay} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative min-w-35 flex items-center justify-center gap-2">
            <span className="font-medium text-slate-700 capitalize">
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
            </span>
            <button
              onClick={() => dateInputRef.current?.showPicker()}
              className="p-1 hover:bg-white rounded-md transition-colors text-slate-400 hover:text-blue-600"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={format(currentDate, "yyyy-MM-dd")}
              onChange={e => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split('-').map(Number)
                  setCurrentDate(new Date(y, m - 1, d))
                }
              }}
              className="sr-only"
            />
          </div>

          <button onClick={handleNextDay} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Daily Queue */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-500" />
          Mi Agenda de Hoy
        </h2>

        {appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            No hay citas para este día.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {appointments.map(appt => (
              <div
                key={appt.id}
                className={`p-5 rounded-2xl border transition-all ${
                  appt.status === "READY"
                    ? "bg-white border-green-200 shadow-sm ring-1 ring-green-100"
                    : appt.status === "WAITING"
                    ? "bg-white border-amber-200 shadow-sm ring-1 ring-amber-50"
                    : "bg-slate-50 border-slate-200 opacity-75"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-100 px-3 py-1 rounded-md text-sm font-semibold text-slate-700">
                    {appt.scheduled_time.slice(0, 5)}
                  </div>

                  {appt.status === "WAITING" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Esperando Triage
                    </span>
                  )}
                  {appt.status === "READY" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Listo para Consulta
                    </span>
                  )}
                  {appt.status === "COMPLETED" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                      Completado
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg mt-0.5">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Paciente</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {getPatientName(appt.patient_id)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-slate-50 p-2 rounded-lg mt-0.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Motivo</p>
                      <p className="text-slate-700">{getPatientReason(appt)}</p>
                    </div>
                  </div>
                </div>

                {appt.status === "READY" && (
                  <button
                    onClick={() => startConsultation(appt.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                  >
                    Iniciar Consulta
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {appt.status === "WAITING" && (
                  <button disabled className="w-full py-3 px-4 bg-slate-100 text-slate-400 font-medium rounded-xl cursor-not-allowed">
                    Pendiente de Enfermería
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}