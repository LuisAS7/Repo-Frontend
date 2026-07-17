import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'

import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { SearchableDropdown } from '../../../components/ui/SearchableDropdown'

import { useNotificationStore } from '../../../context/useNotificationStore'
import { useScheduling } from '../../../hooks/useScheduling'
import { t } from '../../../utils/translations'

import type { ClinicBookingPayload } from '../../../types/scheduling.type'
import type { PatientResponse } from '../../../types/reception'

interface ScheduleAppointmentModalProps {
    open: boolean
    patient?: PatientResponse | null
    patients: PatientResponse[]
    onOpenChange: (open: boolean) => void
    onBooked: () => void
}

export function ScheduleAppointmentModal({
    open,
    patient,
    patients,
    onOpenChange,
    onBooked,
    }: ScheduleAppointmentModalProps) {
    const { addNotification } = useNotificationStore()
    const {
        specialties,
        doctors,
        slots,
        loadingSlots,
        loadSpecialties,
        loadDoctors,
        loadSlots,
        bookAppointment,
    } = useScheduling()

    const [activeStep, setActiveStep] = useState(1)
    const [patientId, setPatientId] = useState(patient?.id ?? '')
    const [specialtyId, setSpecialtyId] = useState('')
    const [doctorId, setDoctorId] = useState('')
    const [date, setDate] = useState('')
    const [slotId, setSlotId] = useState('')
    const [, setReason] = useState('')
    const [bookingError, setBookingError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const selectedPatient =
        patient || patients.find((item) => item.id === patientId) || null

    useEffect(() => {
        if (open) {
        loadSpecialties()
        setActiveStep(1)
        setPatientId(patient?.id ?? '')
        setSpecialtyId('')
        setDoctorId('')
        setDate('')
        setSlotId('')
        setReason('')
        setBookingError(null)
        }
    }, [open, loadSpecialties, patient])

    useEffect(() => {
        if (specialtyId) {
        loadDoctors(specialtyId)
        setDoctorId('')
        setDate('')
        setSlotId('')
        }
    }, [specialtyId, loadDoctors])

    useEffect(() => {
        if (doctorId && date) {
        loadSlots(doctorId, date)
        setSlotId('')
        }
    }, [doctorId, date, loadSlots])

    const patientOptions = patients.map((item) => ({
        value: item.id,
        label: `${item.first_name} ${item.last_name}`,
    }))

    const specialtyOptions = specialties.map((s) => ({
        value: s.id,
        label: t.catalog(s.name),
    }))

    const doctorOptions = doctors.map((d) => ({
        value: d.id,
        label: `${d.full_name} (${t.catalog(d.specialty_name || '')})`,
    }))

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!selectedPatient || !doctorId || !date || !slotId) return

        const slot = slots.find((item) => item.id === slotId)
        if (!slot) return

        setSubmitting(true)
        setBookingError(null)

        const payload: ClinicBookingPayload = {
        patient_id: selectedPatient.id,
        doctor_id: doctorId,
        scheduled_date: slot.scheduled_date,
        scheduled_time: slot.scheduled_time,
        }

        try {
        await bookAppointment(payload)
        toast.success('Cita agendada correctamente')
        addNotification('success', `Cita agendada para ${selectedPatient.first_name} ${selectedPatient.last_name}`)
        onBooked()
        onOpenChange(false)
        } catch (err: any) {
        const detail = err?.response?.data?.detail || err?.message
        const translated = t.error(detail)
        setBookingError(translated)
        toast.error(translated)
        addNotification('error', translated)
        } finally {
        setSubmitting(false)
        }
    }

    const canContinue =
        (activeStep === 1 && !!specialtyId && !!selectedPatient) ||
        (activeStep === 2 && !!doctorId) ||
        (activeStep === 3 && !!date)

    return (
        <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={`Agendar cita${selectedPatient ? ` para ${selectedPatient.first_name}` : ''}`}
        description="Selecciona paciente, especialidad, médico, fecha y horario disponible."
        >
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
            <SearchableDropdown
                label="Paciente"
                placeholder="Buscar paciente..."
                options={[{ value: "", label: "Seleccione paciente" }, ...patientOptions]}
                value={patientId}
                onChange={setPatientId}
                disabled={!!patient}
            />
            </div>

            <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((step) => (
                <div
                key={step}
                className={`rounded-full px-3 py-1.5 text-xs font-bold text-center ${
                    activeStep === step
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
                >
                Paso {step}
                </div>
            ))}
            </div>

            {activeStep === 1 && (
            <SearchableDropdown
                label="Especialidad"
                placeholder="Selecciona especialidad"
                options={specialtyOptions}
                value={specialtyId}
                onChange={setSpecialtyId}
            />
            )}

            {activeStep === 2 && (
            <SearchableDropdown
                label="Médico"
                placeholder="Selecciona médico"
                options={doctorOptions}
                value={doctorId}
                onChange={setDoctorId}
                disabled={!specialtyId}
            />
            )}

            {activeStep === 3 && (
            <Input
                type="date"
                label="Fecha"
                icon={<CalendarDays className="w-4 h-4" />}
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!doctorId}
            />
            )}

            {activeStep === 4 && (
            <div className="space-y-4">
                <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Horarios disponibles</p>
                </div>

                {loadingSlots ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Buscando horarios...</div>
                ) : slots.length === 0 ? (
                <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">No hay horarios disponibles.</div>
                ) : (
                <div className="grid grid-cols-2 gap-2">
                    {slots.map((slot) => (
                    <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSlotId(slot.id)}
                        className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                        slotId === slot.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {slot.scheduled_time}
                    </button>
                    ))}
                </div>
                )}
            </div>
            )}

            {bookingError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {bookingError}
            </div>
            )}

            <div className="flex items-center justify-between gap-3">
            <Button
                type="button"
                variant="ghost"
                onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1))}
                disabled={activeStep === 1}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Atrás
            </Button>

            {activeStep < 4 ? (
                <Button
                type="button"
                variant="primary"
                onClick={() => setActiveStep((prev) => Math.min(prev + 1, 4))}
                disabled={!canContinue}
                >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            ) : (
                <Button type="submit" variant="primary" disabled={submitting || !selectedPatient || !slotId}>
                {submitting ? 'Agendando...' : 'Confirmar cita'}
                </Button>
            )}
            </div>
        </form>
        </Modal>
    )
}