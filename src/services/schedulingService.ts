import { axiosClient } from './axiosClient';
import type { Specialty, Doctor, TimeSlot, ClinicBookingPayload } from '../types/scheduling.type';
import type { AppointmentResponse } from '../types/api.types';

export const schedulingService = {
    // Obtener especialidades
    getSpecialties: async (): Promise<Specialty[]> => {
        const { data } = await axiosClient.get('/scheduling/specialties');
        return data;
    },

    // Obtener doctores (opcionalmente filtrados)
    getDoctors: async (specialtyId?: string): Promise<Doctor[]> => {
        const params = specialtyId ? { specialty_id: specialtyId } : {};
        const { data } = await axiosClient.get('/scheduling/doctors', { params });
        return data;
    },

    // Obtener horarios libres de un doctor en una fecha
    getAvailableSlots: async (doctorId: string, date: string): Promise<TimeSlot[]> => {
        const { data } = await axiosClient.get('/scheduling/schedules', {
            // CORRECCIÓN: El backend espera "date", no "selected_date"
            params: { doctor_id: doctorId, date: date },
        });
        return data;
    },

    // Crear la cita desde recepción
    bookAppointment: async (payload: ClinicBookingPayload): Promise<AppointmentResponse> => {
        const { data } = await axiosClient.post('/appointments', payload);
        return data;
    },

    // Guardar disponibilidad del doctor
    setDoctorAvailability: async (payload: {
        doctor_id: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
        slot_duration_minutes: number;
    }): Promise<void> => {
        await axiosClient.post('/scheduling/doctor-availability', payload);
    },

    // Consultar la disponibilidad guardada
    getDoctorAvailability: async (doctorId: string): Promise<any[]> => {
        const { data } = await axiosClient.get(`/scheduling/doctor-availability/${doctorId}`);
        return data;
    }
};