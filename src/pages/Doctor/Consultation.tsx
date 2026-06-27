import { useState, useEffect, useMemo } from "react";
import { 
    User, CreditCard, Activity, AlertTriangle, Thermometer, 
    Heart, Scale, Search, Plus, Trash2, FileText, Download,
    Droplet, Calendar, History, Stethoscope
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { storageService } from "../../services/storageService";

export function Consultation() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const appointment = useMemo(() => {
        return id ? (storageService.getAppointmentById(Number(id)) || null) : null;
    }, [id]);
    const pastHistory = useMemo(() => {
        if (!id) return [];
        const appt = storageService.getAppointmentById(Number(id));
        return (appt && appt.patient.documentNumber) ? storageService.getPatientHistory(appt.patient.documentNumber) : [];
    }, [id]);

    const [activeTab, setActiveTab] = useState<'general' | 'soap' | 'history'>('soap');
    
    // SOAP State
    const [subjective, setSubjective] = useState("");
    const [objective, setObjective] = useState("");
    const [assessment, setAssessment] = useState("");
    const [plan, setPlan] = useState("");
    
    const [prescriptions, setPrescriptions] = useState([{ medication: "", dose: "", frequency: "", durationDays: "" }]);

    useEffect(() => {
        if (id && !storageService.getAppointmentById(Number(id))) {
            navigate('/doctor/agenda');
        }
    }, [id, navigate]);

    const addPrescription = () => {
        setPrescriptions([...prescriptions, { medication: "", dose: "", frequency: "", durationDays: "" }]);
    };

    const removePrescription = (index: number) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const updatePrescription = (index: number, field: string, value: string) => {
        const newPrescriptions = [...prescriptions];
        newPrescriptions[index] = { ...newPrescriptions[index], [field]: value };
        setPrescriptions(newPrescriptions);
    };

    const handleFinishConsultation = () => {
        if (!appointment) return;
        
        storageService.saveConsultation({
            appointmentId: appointment.id,
            subjective,
            objective,
            assessment,
            plan,
            prescriptions: prescriptions.filter(p => p.medication.trim() !== ""),
            date: new Date().toISOString()
        });

        navigate('/doctor/agenda');
    };

    if (!appointment) return null; // Or a loading spinner

    const patientData = appointment.patient;

    return (
        <div className="max-w-250 mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative transition-colors">
        {/* Header and Tabs */}
        <div className="pt-6 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
            <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center text-lg font-bold">
                {patientData.firstName[0]}{patientData.lastName[0]}
                </div>
                <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {patientData.firstName} {patientData.lastName}
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
                <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-3 text-sm font-medium rounded-t-xl flex items-center gap-2 transition-all ${
                    activeTab === 'general' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                >
                <User className="w-4 h-4" />
                Datos Generales
                </button>
                <button
                onClick={() => setActiveTab('soap')}
                className={`px-6 py-3 text-sm font-medium rounded-t-xl flex items-center gap-2 transition-all ${
                    activeTab === 'soap' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                >
                <Stethoscope className="w-4 h-4" />
                Consulta Activa (SOAP)
                </button>
                <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 text-sm font-medium rounded-t-xl flex items-center gap-2 transition-all ${
                    activeTab === 'history' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                >
                <History className="w-4 h-4" />
                Historial Pasado
                </button>
            </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pb-28 dark:text-slate-100">
            {/* TAB 1: Datos Generales */}
            {activeTab === 'general' && (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Información del Paciente
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Nombre Completo</span>
                    <span className="font-medium">{patientData.firstName} {patientData.lastName}</span>
                    </div>
                    <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Documento</span>
                    <span className="font-medium flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        {patientData.documentNumber}
                    </span>
                    </div>
                </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Antecedentes Médicos
                </h3>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Grupo Sanguíneo</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium text-sm border border-red-100 dark:border-red-900/30">
                        <Droplet className="w-3.5 h-3.5" />
                        {patientData.medicalBackground?.bloodType || "N/A"}
                    </span>
                    </div>

                    {patientData.medicalBackground?.allergies && patientData.medicalBackground.allergies.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-500 font-semibold text-sm mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Alergias Registradas
                        </div>
                        <div className="flex flex-wrap gap-2">
                        {patientData.medicalBackground.allergies.map(allergy => (
                            <span key={allergy} className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800/50">
                            {allergy}
                            </span>
                        ))}
                        </div>
                    </div>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Enfermedades Crónicas</span>
                    <div className="flex flex-wrap gap-2">
                        {patientData.medicalBackground?.chronicDiseases && patientData.medicalBackground.chronicDiseases.length > 0 ? (
                        patientData.medicalBackground.chronicDiseases.map(disease => (
                            <span key={disease} className="px-2.5 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-600">
                            {disease}
                            </span>
                        ))
                        ) : (
                        <span className="text-sm text-slate-400 italic">Ninguna registrada</span>
                        )}
                    </div>
                    </div>
                </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <Activity className="w-4 h-4 text-green-600 dark:text-green-500" />
                    Signos Vitales (Triage Actual)
                </h3>
                
                {patientData.triage ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                        <Scale className="w-3.5 h-3.5" /> Peso
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{patientData.triage.weightKg} kg</div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                        <User className="w-3.5 h-3.5" /> Altura
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{patientData.triage.heightCm} cm</div>
                    </div>

                    <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">IMC (BMI)</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-slate-100">{patientData.triage.bmi}</span>
                    </div>

                    <div className="col-span-2 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Presión Arterial</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{patientData.triage.bloodPressure}</span>
                    </div>

                    <div className="col-span-2 bg-orange-50/50 dark:bg-orange-900/10 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Temperatura</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{patientData.triage.temperatureC}°C</span>
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
                    className="w-full h-24 p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors text-sm dark:text-slate-100"
                    placeholder="Motivo de consulta, síntomas referidos por el paciente..."
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Objetivo (O)</label>
                    <textarea 
                    className="w-full h-24 p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors text-sm dark:text-slate-100"
                    placeholder="Hallazgos del examen físico, resultados de laboratorio..."
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    />
                </div>

                <div className="bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Apreciación / Diagnóstico (A)</label>
                    <div className="mb-3 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input 
                        type="text" 
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-sm shadow-sm dark:text-slate-100"
                        placeholder="Buscar diagnóstico CIE-10..."
                    />
                    </div>
                    <textarea 
                    className="w-full h-20 p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 transition-colors text-sm dark:text-slate-100"
                    placeholder="Análisis y diagnóstico del profesional..."
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Plan (P)</label>
                    <textarea 
                    className="w-full h-24 p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors text-sm dark:text-slate-100"
                    placeholder="Tratamiento sugerido, recomendaciones, próximas citas..."
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
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
                        <input 
                            type="text" 
                            placeholder="Medicamento" 
                            value={rx.medication}
                            onChange={(e) => updatePrescription(idx, 'medication', e.target.value)}
                            className="col-span-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100" 
                        />
                        <input 
                            type="text" 
                            placeholder="Dosis" 
                            value={rx.dose}
                            onChange={(e) => updatePrescription(idx, 'dose', e.target.value)}
                            className="col-span-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100" 
                        />
                        <input 
                            type="text" 
                            placeholder="Frecuencia" 
                            value={rx.frequency}
                            onChange={(e) => updatePrescription(idx, 'frequency', e.target.value)}
                            className="col-span-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100" 
                        />
                        <input 
                            type="text" 
                            placeholder="Duración (Días)" 
                            value={rx.durationDays}
                            onChange={(e) => updatePrescription(idx, 'durationDays', e.target.value)}
                            className="col-span-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100" 
                        />
                        </div>
                        <button 
                        onClick={() => removePrescription(idx)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                        <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    ))}
                    
                    <button 
                    onClick={addPrescription}
                    className="w-full py-2.5 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors font-medium text-sm"
                    >
                    <Plus className="w-4 h-4" /> Añadir Medicamento
                    </button>
                </div>
                </div>
            </div>
            )}

            {/* TAB 3: Historial Pasado */}
            {activeTab === 'history' && (
            <div className="max-w-3xl mx-auto relative pl-4">
                <div className="absolute left-5.75 top-2 bottom-5 w-px bg-slate-200 dark:bg-slate-700"></div>

                <div className="space-y-8">
                {pastHistory.map((record) => (
                    <div key={record.id} className="relative pl-10">
                    <div className="absolute -left-0.5 top-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full ring-4 ring-white dark:ring-slate-900"></div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                            <Calendar className="w-4 h-4" />
                            {record.date}
                        </div>
                        <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                            <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                        </div>
                        
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-base mb-3 leading-tight">
                        {record.diagnosisCie10}
                        </div>
                        
                        <div className="text-sm text-slate-600 dark:text-slate-300 mb-4 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-400 block mb-1">Plan:</span>
                        {record.plan}
                        </div>
                        
                        {record.prescriptions.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Receta Indicada</div>
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-3 space-y-1.5">
                            {record.prescriptions.map((rx, idx) => (
                                <div key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span> {rx}
                                </div>
                            ))}
                            </div>
                        </div>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] transition-colors">
            <button 
            onClick={() => navigate('/doctor/agenda')}
            className="px-6 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
            Cancelar
            </button>
            <button 
            onClick={handleFinishConsultation}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center gap-2"
            >
            Finalizar Consulta
            </button>
        </div>
        </div>
    );
}