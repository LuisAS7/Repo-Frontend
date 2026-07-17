import { useEffect, useState } from "react";
import { Clock, Eye, CalendarX } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/layout/PageHeader";
import { toast } from "react-hot-toast";
import { useNotificationStore } from "../../context/useNotificationStore";
import { t } from "../../utils/translations";
import { staffService } from "../../services/staffService";
import { schedulingService } from "../../services/schedulingService";
import { DoctorAvailabilityModal } from "./components/DoctorAvailabilityModal";
import type { StaffResponse } from "../../types/reception";

const WEEKDAYS_MAP: Record<number, string> = {
    1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo"
};

export function DoctorAvailabilityPage() {
    const [doctors, setDoctors] = useState<StaffResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedDoctor, setSelectedDoctor] = useState<StaffResponse | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    
    // Estados para el nuevo Modal de "Ver Horario"
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState<any[]>([]);
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    useNotificationStore();

    const loadDoctors = async () => {
        try {
        setLoading(true);
        setError(null);
        const allStaff = await staffService.getAll();
        setDoctors(allStaff.filter((item) => item.role === "DOCTOR" && item.is_active));
        } catch (err: any) {
        const message = t.error(err?.response?.data?.detail) || err?.message || "Error al cargar los médicos";
        setError(message);
        toast.error(message);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    // Controladores del Modal de Asignación (Crear/Editar)
    const openAssignModal = (doctor: StaffResponse) => {
        setSelectedDoctor(doctor);
        setIsAssignModalOpen(true);
    };

    // Controladores del Modal de Visualización
    const openViewModal = async (doctor: StaffResponse) => {
        setSelectedDoctor(doctor);
        setIsViewModalOpen(true);
        setLoadingSchedule(true);
        try {
        const schedule = await schedulingService.getDoctorAvailability(doctor.id);
        setCurrentSchedule(schedule);
        } catch (err) {
        toast.error("No se pudo cargar el horario del médico");
        } finally {
        setLoadingSchedule(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-400 dark:text-slate-500 animate-pulse">Cargando médicos...</div>;
    if (error) return <div className="p-12 text-center text-red-500 dark:text-red-400">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
        
        <PageHeader 
            title="Disponibilidad de Doctores" 
            subtitle="Asigna y revisa los bloques de atención regular."
            actions={
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                {doctors.length} Médico{doctors.length !== 1 && "s"} Activo{doctors.length !== 1 && "s"}
            </span>
            }
        />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
            <Card key={doctor.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                <CardContent className="space-y-5 p-5">
                
                <div className="flex items-start justify-between gap-4">
                    <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        Dr(a). {doctor.first_name} {doctor.last_name}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {t.catalog(doctor.doctor_profile?.specialty.name ?? "Sin especialidad")}
                    </p>
                    </div>
                    <Badge variant="teal" className="shrink-0">CMP: {doctor.doctor_profile?.medical_license || "N/A"}</Badge>
                </div>

                <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                    <span className="text-slate-500">Correo</span>
                    <span className="font-medium truncate ml-2">{doctor.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                    <span className="text-slate-500">Estado</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Activo</span>
                    </div>
                </div>

                {/* Botones de Acción (El nuevo diseño) */}
                <div className="flex gap-3 pt-2">
                    <Button 
                    variant="secondary" 
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700" 
                    onClick={() => openViewModal(doctor)}
                    >
                    <Eye className="w-4 h-4 mr-2" /> Ver
                    </Button>
                    <Button 
                    variant="primary" 
                    className="w-full" 
                    onClick={() => openAssignModal(doctor)}
                    >
                    <Clock className="w-4 h-4 mr-2" /> Asignar
                    </Button>
                </div>

                </CardContent>
            </Card>
            ))}
        </div>

        {/* Modal 1: Asignar / Editar Disponibilidad */}
        <DoctorAvailabilityModal
            open={isAssignModalOpen}
            doctor={selectedDoctor}
            onOpenChange={setIsAssignModalOpen}
            onSaved={() => {
            setIsAssignModalOpen(false);
            loadDoctors();
            }}
        />

        {/* Modal 2: Ver Disponibilidad Actual */}
        <Modal
            open={isViewModalOpen}
            onOpenChange={setIsViewModalOpen}
            title={`Horario: Dr(a). ${selectedDoctor?.last_name ?? ""}`}
            description="Días de atención registrados actualmente en el sistema."
        >
            <div className="space-y-4">
            {loadingSchedule ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">Consultando agenda...</div>
            ) : currentSchedule.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <CalendarX className="w-8 h-8 mb-3 text-slate-400 dark:text-slate-500" />
                <p>Este médico no tiene horarios asignados.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                {currentSchedule.map((sched: any) => (
                    <div key={sched.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold border dark:border-blue-800/50">
                        {WEEKDAYS_MAP[sched.day_of_week].charAt(0)}
                        </div>
                        <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{WEEKDAYS_MAP[sched.day_of_week]}</p>
                        {/* Texto aclarado para mejor visibilidad */}
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Citas cada {sched.slot_duration_minutes} min</p>
                        </div>
                    </div>
                    <div className="text-right">
                        {/* Badge rediseñado: Azul brillante en modo oscuro para máximo contraste */}
                        <Badge variant="neutral" className="font-mono text-sm px-3 py-1.5 bg-slate-100 text-slate-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50">
                        {sched.start_time.slice(0, 5)} - {sched.end_time.slice(0, 5)}
                        </Badge>
                    </div>
                    </div>
                ))}
                </div>
            )}

            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Cerrar
                </Button>
            </div>
            </div>
        </Modal>

        </div>
    );
}