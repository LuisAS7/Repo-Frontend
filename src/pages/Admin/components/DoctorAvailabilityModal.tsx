import { useEffect, useState } from "react";
import { Clock, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useNotificationStore } from "../../../context/useNotificationStore";
import { t } from "../../../utils/translations";
import { schedulingService } from "../../../services/schedulingService";
import type { StaffResponse } from "../../../types/reception";

interface DoctorAvailabilityModalProps {
    open: boolean;
    doctor: StaffResponse | null;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
}

const WEEKDAYS = [
    { value: 1, label: "L", fullName: "Lunes" },
    { value: 2, label: "M", fullName: "Martes" },
    { value: 3, label: "X", fullName: "Miércoles" },
    { value: 4, label: "J", fullName: "Jueves" },
    { value: 5, label: "V", fullName: "Viernes" },
    { value: 6, label: "S", fullName: "Sábado" },
    { value: 7, label: "D", fullName: "Domingo" },
];

export function DoctorAvailabilityModal({
    open,
    doctor,
    onOpenChange,
    onSaved,
}: DoctorAvailabilityModalProps) {
    const { addNotification } = useNotificationStore();
    
    // Array para selección múltiple de días (Por defecto seleccionamos L-V)
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("17:00");
    const [duration, setDuration] = useState("30");
    
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
        setSelectedDays([1, 2, 3, 4, 5]); // Reset a Lunes-Viernes
        setStartTime("08:00");
        setEndTime("17:00");
        setDuration("30");
        setError(null);
        }
    }, [open, doctor]);

    const toggleDay = (dayValue: number) => {
        setSelectedDays(prev => 
        prev.includes(dayValue) 
            ? prev.filter(d => d !== dayValue) 
            : [...prev, dayValue].sort()
        );
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!doctor) return;

        // 1. Validaciones
        if (selectedDays.length === 0) {
        setError("Debes seleccionar al menos un día de la semana.");
        return;
        }
        if (!startTime || !endTime || !duration) {
        setError("Debes completar los horarios y la duración de la cita.");
        return;
        }
        if (startTime >= endTime) {
        setError("La hora de inicio debe ser estrictamente anterior a la de fin.");
        return;
        }
        if (Number(duration) < 10) {
        setError("La duración de la cita debe ser de al menos 10 minutos.");
        return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Enviar múltiples peticiones en paralelo (una por cada día seleccionado)
            const promises = selectedDays.map(day => 
                schedulingService.setDoctorAvailability({
                doctor_id: doctor.id,
                day_of_week: day,
                start_time: startTime,
                end_time: endTime,
                slot_duration_minutes: Number(duration),
                })
            );

            await Promise.all(promises);

            toast.success("Disponibilidad guardada con éxito");
            addNotification("success", `Horario actualizado para el Dr(a). ${doctor.last_name}`);
            onSaved();
        } catch (err: any) {
        const detail = err?.response?.data?.detail || err?.message;
        const message = t.error(detail) || "Error de servidor al guardar la disponibilidad.";
        setError(message);
        toast.error(message);
        addNotification("error", message);
        } finally {
        setSubmitting(false);
        }
    };

    return (
        <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={`Horario: Dr(a). ${doctor?.first_name ?? ""} ${doctor?.last_name ?? ""}`}
        description="Selecciona los días y el rango de atención regular."
        >
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Selector de Múltiples Días (Súper UX) */}
            <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Días de la semana
            </label>
            <div className="flex gap-2 justify-between">
                {WEEKDAYS.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                    <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    title={day.fullName}
                    className={`size-10 rounded-full text-sm font-bold transition-all focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:outline-none ${
                        isSelected 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                    >
                    {day.label}
                    </button>
                );
                })}
            </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
            <Input
                type="time"
                label="Hora de Inicio"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                icon={<Clock className="w-4 h-4 text-slate-400" />}
                required
            />
            <Input
                type="time"
                label="Hora de Fin"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                icon={<Clock className="w-4 h-4 text-slate-400" />}
                required
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Minutos por paciente (Duración del bloque)
            </label>
            <p className="text-xs text-slate-500 mb-2">
                Ej: Si pones 30 mins, se agendarán citas 08:00, 08:30, 09:00...
            </p>
            <Input
                type="number"
                min={10}
                step={5}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                icon={<CalendarDays className="w-4 h-4 text-slate-400" />}
                required
            />
            </div>

            {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
            </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Guardando..." : "Asignar Horario"}
            </Button>
            </div>
        </form>
        </Modal>
    );
}