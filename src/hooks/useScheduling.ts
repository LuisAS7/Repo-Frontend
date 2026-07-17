import { useCallback, useState } from 'react';
import { schedulingService } from '../services/schedulingService';
import type { ClinicBookingPayload, Doctor, Specialty, TimeSlot } from '../types/scheduling.type';

export function useScheduling() {
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loadingSpecialties, setLoadingSpecialties] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSpecialties = useCallback(async () => {
        setLoadingSpecialties(true);
        setError(null);
        try {
        setSpecialties(await schedulingService.getSpecialties());
        } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Error cargando especialidades');
        } finally {
        setLoadingSpecialties(false);
        }
    }, []);

    const loadDoctors = useCallback(async (specialtyId?: string) => {
        setLoadingDoctors(true);
        setError(null);
        try {
        setDoctors(await schedulingService.getDoctors(specialtyId));
        } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Error cargando médicos');
        } finally {
        setLoadingDoctors(false);
        }
    }, []);

    const loadSlots = useCallback(async (doctorId: string, date: string) => {
        setLoadingSlots(true);
        setError(null);
        try {
        setSlots(await schedulingService.getAvailableSlots(doctorId, date));
        } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Error cargando horarios');
        } finally {
        setLoadingSlots(false);
        }
    }, []);

    const bookAppointment = useCallback(async (payload: ClinicBookingPayload) => {
        setError(null);
        return schedulingService.bookAppointment(payload);
    }, []);

    return {
        specialties,
        doctors,
        slots,
        loadingSpecialties,
        loadingDoctors,
        loadingSlots,
        error,
        loadSpecialties,
        loadDoctors,
        loadSlots,
        bookAppointment,
    };
}