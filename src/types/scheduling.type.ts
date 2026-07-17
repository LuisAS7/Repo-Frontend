export interface Specialty {
    id: string;
    name: string;
    description: string;
}

export interface Doctor {
    id: string;
    full_name: string;
    specialty_id: string;
    specialty_name: string;
}

export interface TimeSlot {
    id: string;
    scheduled_date: string;
    scheduled_time: string;
    is_available: boolean;
}

export interface ClinicBookingPayload {
    patient_id: string;
    doctor_id: string;
    scheduled_date: string;
    scheduled_time: string;
    reason?: string;
}