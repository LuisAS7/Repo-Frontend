import { useState, useEffect } from "react";
import {
  User, CreditCard, Activity, AlertTriangle, Thermometer,
  Heart, Scale, Search, Plus, Trash2, FileText, Download,
  Droplet, Calendar, History, Stethoscope
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../services/apiClient";
import { useNotificationStore } from "../../context/useNotificationStore";
import {t} from "../../utils/translations";
import {toast} from "react-hot-toast";
import type { AppointmentResponse, PatientResponse } from "../../types/reception";

interface DiagnosisCatalog {
  id: string
  code: string
  name: string
}

interface ConsultationHistory {
  id: string
  created_at: string
  assessment: string | null
  plan: string | null
  prescriptions: {
    id: string
    medication: string
    dose: string
    frequency: string
    duration_days: number
  }[]
  diagnoses: {
    id: string
    code: string
    name: string
  }[]
}

export function Consultation() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [appointment, setAppointment]   = useState<AppointmentResponse | null>(null)
  const [patient, setPatient]           = useState<PatientResponse | null>(null)
  const [pastHistory, setPastHistory]   = useState<ConsultationHistory[]>([])
  const [diagnoses, setDiagnoses]       = useState<DiagnosisCatalog[]>([])
  const [diagnosisSearch, setDiagnosisSearch] = useState("")
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<DiagnosisCatalog[]>([])
  const [showDiagnosisDropdown, setShowDiagnosisDropdown] = useState(false)
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'general' | 'soap' | 'history'>('soap')

  const { addNotification } = useNotificationStore();
  // SOAP State
  const [subjective, setSubjective] = useState("")
  const [objective, setObjective]   = useState("")
  const [assessment, setAssessment] = useState("")
  const [plan, setPlan]             = useState("")

  const [prescriptions, setPrescriptions] = useState([
    { medication: "", dose: "", frequency: "", durationDays: "" }
  ])

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        const [appt, diags] = await Promise.all([
          apiClient.get<AppointmentResponse>(`/appointments/${id}`),
          apiClient.get<DiagnosisCatalog[]>("/catalogs/diagnoses"),
        ])
        setAppointment(appt)
        setDiagnoses(diags)

        const pat = await apiClient.get<PatientResponse>(`/patients/${appt.patient_id}`)
        setPatient(pat)

        const allAppts = await apiClient.get<AppointmentResponse[]>("/appointments/?skip=0&limit=100")
        const completed = (allAppts as any[]).filter(
          (a: AppointmentResponse) =>
            a.patient_id === appt.patient_id &&
            a.status === "COMPLETED" &&
            a.id !== id &&
            a.consultation
        )
        setPastHistory(completed.map((a: any) => a.consultation))
      } catch (err: any) {
        const message = t.error(err.response?.data?.detail) || err.message || "Error al cargar la consulta"
        setError(message)
        toast.error(message)
        addNotification("error", message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, addNotification])

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medication: "", dose: "", frequency: "", durationDays: "" }])
  }

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  const updatePrescription = (index: number, field: string, value: string) => {
    const updated = [...prescriptions]
    updated[index] = { ...updated[index], [field]: value }
    setPrescriptions(updated)
  }

  const toggleDiagnosis = (diag: DiagnosisCatalog) => {
    setSelectedDiagnoses(prev =>
      prev.find(d => d.id === diag.id)
        ? prev.filter(d => d.id !== diag.id)
        : [...prev, diag]
    )
  }

  const filteredDiagnoses = diagnoses.filter(d =>
    d.name.toLowerCase().includes(diagnosisSearch.toLowerCase()) ||
    d.code.toLowerCase().includes(diagnosisSearch.toLowerCase())
  ).slice(0, 8)

  const handleFinishConsultation = async () => {
    if (!appointment) return
    setSubmitting(true)
    const toastId = toast.loading("Guardando consulta...")
    try {
      await apiClient.post(`/appointments/${appointment.id}/consultation`, {
        subjective,
        objective,
        assessment,
        plan,
        diagnosis_ids: selectedDiagnoses.map(d => d.id),
        prescriptions: prescriptions
          .filter(p => p.medication.trim() !== "")
          .map(p => ({
            medication: p.medication,
            dose: p.dose,
            frequency: p.frequency,
            duration_days: parseInt(p.durationDays) || 1,
          })),
      })
      toast.success("Consulta guardada correctamente", { id: toastId })
      addNotification("success", "Consulta finalizada correctamente")
      navigate("/doctor/agenda")
    } catch (err: any) {
      const message = t.error(err.response?.data?.detail) || err.message || "Error al guardar la consulta"
      toast.error(message, { id: toastId })
      addNotification("error", message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-slate-400">Cargando consulta...</div>
  if (error)   return <div className="p-12 text-center text-red-500">{error}</div>
  if (!appointment || !patient) return null

  return (
    <div className="max-w-250 mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative transition-colors">
      {/* Header and Tabs */}
      <div className="pt-6 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-lg font-bold">
              {patient.first_name[0]}{patient.last_name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {patient.first_name} {patient.last_name}
              </h2>
              <span className="px-2 py-0.5 mt-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-bold border border-green-200 dark:border-green-800 inline-block">
                Consulta En Curso
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center border-b border-slate-200 dark:border-slate-800">
          <div className="flex space-x-2 pb-[-1px]">
            {[
              { key: 'general', icon: <User className="w-4 h-4" />, label: 'Datos Generales' },
              { key: 'soap', icon: <Stethoscope className="w-4 h-4" />, label: 'Consulta Activa (SOAP)' },
              { key: 'history', icon: <History className="w-4 h-4" />, label: 'Historial Pasado' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 text-sm font-medium rounded-t-xl flex items-center gap-2 transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-28 dark:text-slate-100">

        {/* TAB 1: Datos Generales */}
        {activeTab === 'general' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <User className="w-4 h-4 text-blue-600" /> Información del Paciente
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Nombre Completo</span>
                  <span className="font-medium">{patient.first_name} {patient.last_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Documento</span>
                  <span className="font-medium flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> {patient.document_number}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Fecha de Nacimiento</span>
                  <span className="font-medium">{patient.birth_date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Teléfono</span>
                  <span className="font-medium">{patient.phone ?? "No registrado"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FileText className="w-4 h-4 text-blue-600" /> Antecedentes Médicos
              </h3>

              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Grupo Sanguíneo</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-medium text-sm border border-red-100">
                  <Droplet className="w-3.5 h-3.5" />
                  {patient.medical_background?.blood_type ?? "N/A"}
                </span>
              </div>

              {patient.allergies && patient.allergies.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" /> Alergias Registradas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map(a => (
                      <span key={a.id} className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-medium border border-amber-200">
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Enfermedades Crónicas</span>
                <div className="flex flex-wrap gap-2">
                  {patient.chronic_diseases && patient.chronic_diseases.length > 0 ? (
                    patient.chronic_diseases.map(d => (
                      <span key={d.id} className="px-2.5 py-1 bg-white text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                        {d.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400 italic">Ninguna registrada</span>
                  )}
                </div>
              </div>
            </div>

            {/* Triage */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Activity className="w-4 h-4 text-green-600" /> Signos Vitales (Triage Actual)
              </h3>
              {appointment.triage ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Scale className="w-3.5 h-3.5" /> Peso</div>
                    <div className="font-semibold">{appointment.triage.weight_kg} kg</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><User className="w-3.5 h-3.5" /> Altura</div>
                    <div className="font-semibold">{appointment.triage.height_cm} cm</div>
                  </div>
                  <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                    <span className="text-sm text-slate-500 font-medium">IMC (BMI)</span>
                    <span className="font-bold text-lg">{appointment.triage.bmi}</span>
                  </div>
                  <div className="col-span-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-slate-700 font-medium">Presión Arterial</span>
                    </div>
                    <span className="font-semibold">{appointment.triage.blood_pressure}</span>
                  </div>
                  <div className="col-span-2 bg-orange-50/50 p-3 rounded-xl border border-orange-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-slate-700 font-medium">Temperatura</span>
                    </div>
                    <span className="font-semibold">{appointment.triage.temperature_c}°C</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500">No hay datos de triage registrados.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SOAP */}
        {activeTab === 'soap' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Subjetivo (S)</label>
                <textarea
                  className="w-full h-24 p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors text-sm dark:text-slate-100"
                  placeholder="Motivo de consulta, síntomas referidos por el paciente..."
                  value={subjective}
                  onChange={e => setSubjective(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Objetivo (O)</label>
                <textarea
                  className="w-full h-24 p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors text-sm dark:text-slate-100"
                  placeholder="Hallazgos del examen físico, resultados de laboratorio..."
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                />
              </div>

              <div className="bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Apreciación / Diagnóstico (A)</label>

                {/* Diagnosis Search */}
                <div className="mb-3 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-sm shadow-sm dark:text-slate-100"
                    placeholder="Buscar diagnóstico CIE-10..."
                    value={diagnosisSearch}
                    onChange={e => { setDiagnosisSearch(e.target.value); setShowDiagnosisDropdown(true) }}
                    onFocus={() => setShowDiagnosisDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDiagnosisDropdown(false), 200)}
                  />
                  {showDiagnosisDropdown && diagnosisSearch && filteredDiagnoses.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                      {filteredDiagnoses.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onMouseDown={() => { toggleDiagnosis(d); setDiagnosisSearch("") }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2"
                        >
                          <span className="font-mono text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{d.code}</span>
                          <span className="text-slate-700">{d.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Diagnoses */}
                {selectedDiagnoses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedDiagnoses.map(d => (
                      <span key={d.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium border border-blue-200">
                        {d.code} - {d.name}
                        <button onClick={() => toggleDiagnosis(d)} className="ml-1 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                )}

                <textarea
                  className="w-full h-20 p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-slate-800 transition-colors text-sm dark:text-slate-100"
                  placeholder="Análisis y diagnóstico del profesional..."
                  value={assessment}
                  onChange={e => setAssessment(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Plan (P)</label>
                <textarea
                  className="w-full h-24 p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors text-sm dark:text-slate-100"
                  placeholder="Tratamiento sugerido, recomendaciones, próximas citas..."
                  value={plan}
                  onChange={e => setPlan(e.target.value)}
                />
              </div>
            </div>

            {/* Prescriptions */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Receta Médica</h3>
              <div className="space-y-3">
                {prescriptions.map((rx, idx) => (
                  <div key={idx} className="flex gap-2 items-start bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                      <input type="text" placeholder="Medicamento" value={rx.medication}
                        onChange={e => updatePrescription(idx, 'medication', e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100" />
                      <input type="text" placeholder="Dosis" value={rx.dose}
                        onChange={e => updatePrescription(idx, 'dose', e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100" />
                      <input type="text" placeholder="Frecuencia" value={rx.frequency}
                        onChange={e => updatePrescription(idx, 'frequency', e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100" />
                      <input type="text" placeholder="Duración (Días)" value={rx.durationDays}
                        onChange={e => updatePrescription(idx, 'durationDays', e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100" />
                    </div>
                    <button onClick={() => removePrescription(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button onClick={addPrescription}
                  className="w-full py-2.5 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors font-medium text-sm">
                  <Plus className="w-4 h-4" /> Añadir Medicamento
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Historial Pasado */}
        {activeTab === 'history' && (
          <div className="max-w-3xl mx-auto relative pl-4">
            <div className="absolute left-5.75 top-2 bottom-5 w-px bg-slate-200 dark:bg-slate-700" />
            {pastHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No hay historial previo para este paciente.</div>
            ) : (
              <div className="space-y-8">
                {pastHistory.map((record, idx) => (
                  <div key={record?.id ?? idx} className="relative pl-10">
                    <div className="absolute -left-0.5 top-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full ring-4 ring-white dark:ring-slate-900" />
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(record.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </div>

                      {record.diagnoses?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {record.diagnoses.map(d => (
                            <span key={d.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono border border-blue-100">
                              {d.code} - {d.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-base mb-3 leading-tight">
                        {record.assessment ?? "Sin diagnóstico registrado"}
                      </div>

                      <div className="text-sm text-slate-600 dark:text-slate-300 mb-4 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-400 block mb-1">Plan:</span>
                        {record.plan ?? "Sin plan registrado"}
                      </div>

                      {record.prescriptions?.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Receta Indicada</div>
                          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-3 space-y-1.5">
                            {record.prescriptions.map((rx, i) => (
                              <div key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                {rx.medication} {rx.dose} — {rx.frequency} por {rx.duration_days} días
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => navigate('/doctor/agenda')}
          className="px-6 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleFinishConsultation}
          disabled={submitting}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
        >
          {submitting ? "Guardando..." : "Finalizar Consulta"}
        </button>
      </div>
    </div>
  )
}