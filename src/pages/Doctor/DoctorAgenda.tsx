import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, User, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { storageService } from "../../services/storageService";
import type { Appointment } from "../../services/storageService";

export function DoctorAgenda() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Load appointments from local storage on mount
        setAppointments(storageService.getAppointments());
    }, []);

    const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
    const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));

    const startConsultation = (appointmentId: number) => {
        navigate(`/doctor/consultation/${appointmentId}`);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Buenos días, Dr. Torres
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
                Tienes <span className="font-semibold text-blue-600">4 citas</span> programadas para hoy.
            </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <button 
                onClick={handlePrevDay}
                className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 shadow-sm"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="min-w-35 text-center font-medium text-slate-700 capitalize">
                {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
            </div>

            <button 
                onClick={handleNextDay}
                className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 shadow-sm"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
            </div>
        </div>

        {/* Main Content (Daily Queue) */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            Mi Agenda de Hoy
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
            {appointments.map((appt) => (
                <div 
                key={appt.id} 
                className={`p-5 rounded-2xl border transition-all ${
                    appt.status === 'READY' 
                    ? 'bg-white border-green-200 shadow-sm ring-1 ring-green-100' 
                    : appt.status === 'WAITING' 
                    ? 'bg-white border-amber-200 shadow-sm ring-1 ring-amber-50' 
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
                >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                    <div className="bg-slate-100 px-3 py-1 rounded-md text-sm font-semibold text-slate-700">
                        {appt.time}
                    </div>
                    </div>
                    
                    {/* Status Badges */}
                    {appt.status === 'WAITING' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Esperando Triage
                    </span>
                    )}
                    {appt.status === 'READY' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Listo para Consulta
                    </span>
                    )}
                    {appt.status === 'COMPLETED' && (
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
                        {appt.patient.firstName} {appt.patient.lastName}
                        </p>
                    </div>
                    </div>

                    <div className="flex items-start gap-3">
                    <div className="bg-slate-50 p-2 rounded-lg mt-0.5">
                        <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Motivo</p>
                        <p className="text-slate-700">{appt.reason}</p>
                    </div>
                    </div>
                </div>

                {/* Call-to-Action */}
                {appt.status === 'READY' && (
                    <button 
                    onClick={() => startConsultation(appt.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                    Iniciar Consulta
                    <ArrowRight className="w-4 h-4" />
                    </button>
                )}
                {appt.status === 'WAITING' && (
                    <button disabled className="w-full py-3 px-4 bg-slate-100 text-slate-400 font-medium rounded-xl cursor-not-allowed">
                    Pendiente de Enfermería
                    </button>
                )}
                </div>
            ))}
            </div>
        </div>
        </div>
    );
}