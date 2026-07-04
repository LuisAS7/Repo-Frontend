import { useState, useEffect } from 'react'
import { Activity, Search, AlertTriangle } from "lucide-react";
import {toast} from "react-hot-toast";
import { useNotificationStore } from '../../context/useNotificationStore';
import { Modal } from '../../components/ui/Modal'
import { nurseService } from '../../services/nurseService';
import type { AppointmentResponse } from '../../types/api.types';
import { t } from '../../utils/translations';

export function NurseDashboard() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { addNotification } = useNotificationStore();

  const isFormValid = weight && height && bloodPressure && temperature;

  const loadWaitingAppointments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await nurseService.getWaitingAppointments()
      setAppointments(data)
    } catch (err: any) {
      const message = t.error(err.response?.data?.detail) || 'Error al cargar los pacientes. Intente nuevamente.'
      setError(message)
      toast.error(message)
      addNotification("error", message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWaitingAppointments();
  }, []);

  const handleTakeVitals = (appointment: AppointmentResponse) => {
    setSelectedAppointment(appointment);
    setWeight("");
    setHeight("");
    setBloodPressure("");
    setTemperature("");
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
  };

  const calculateBMI = () => {
    if (weight && height) {
      const w = parseFloat(weight);
      const h = parseFloat(height) / 100;
      if (h > 0) return (w / (h * h)).toFixed(1);
    }
    return "--";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppointment) return

    const toastId = toast.loading("Guardando triage...")
    try {
      setIsSubmitting(true)
      const bmi = calculateBMI()

      await nurseService.registerTriage(selectedAppointment.id, {
        weight_kg: parseFloat(weight),
        height_cm: parseFloat(height),
        bmi: bmi !== "--" ? parseFloat(bmi) : undefined,
        blood_pressure: bloodPressure,
        temperature_c: parseFloat(temperature),
      })

      await loadWaitingAppointments()
      setSelectedAppointment(null)
      setError(null)

      toast.success("Triage registrado correctamente", { id: toastId })
      addNotification("success", "Signos vitales registrados correctamente")
    } catch (err: any) {
      const message = t.error(err.response?.data?.detail) || 'Error al registrar el triage. Intente nuevamente.'
      setError(message)
      toast.error(message, { id: toastId })
      addNotification("error", message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredAppointments = appointments.filter(appt => {
    return appt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      || appt.id.includes(searchTerm);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fila de Triage</h1>
          <p className="text-slate-500 mt-1">Pacientes en sala de espera listos para toma de signos vitales.</p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por motivo..."
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 w-full md:w-64 bg-white"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={loadWaitingAppointments}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium">Cargando pacientes...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredAppointments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredAppointments.map((appt) => (
                <div key={appt.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-12 w-12 rounded-full bg-amber-100 text-amber-700 items-center justify-center font-bold text-lg">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          {t.status(appt.status)}
                        </span>
                        <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {appt.scheduled_time}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Cita #{appt.id.slice(0, 8)}</h3>
                      <p className="text-sm text-slate-500">Motivo: {appt.reason || 'No especificado'} · Fecha: {appt.scheduled_date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTakeVitals(appt)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
                  >
                    <Activity className="w-4 h-4" /> Tomar Signos Vitales
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Estado vacío correcto
            <div className="p-12 text-center text-slate-500">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No hay pacientes esperando triage en este momento.</p>
            </div>
          )}
        </div>
      )}

      <Modal
        open={!!selectedAppointment}
        onOpenChange={(isOpen) => !isOpen && handleCloseModal()}
        title="Evaluación de Triage"
        description="Registre los signos vitales del paciente."
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Cita #{selectedAppointment.id.slice(0, 8)}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Fecha: {selectedAppointment.scheduled_date} · Hora: {selectedAppointment.scheduled_time}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Motivo: {selectedAppointment.reason || 'No especificado'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="weight">Peso (kg)</label>
                  <input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-lg text-center"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="height">Altura (cm)</label>
                  <input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-lg text-center"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="bp">Presión Arterial</label>
                  <input
                    id="bp"
                    type="text"
                    placeholder="120/80"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-lg text-center"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="temp">Temperatura (°C)</label>
                  <input
                    id="temp"
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-lg text-center"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center mt-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Índice de Masa Corporal (IMC)</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-4 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  {calculateBMI()}
                </span>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar y Enviar al Médico'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}