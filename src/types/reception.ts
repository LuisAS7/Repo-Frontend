export type AppointmentStatus =
  | "SCHEDULED"
  | "WAITING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED"; // doble L, así está en la BD

export type AppointmentOrigin = "VALSYNC" | "VALCARE" | "WALK_IN";

export interface AppointmentResponse {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  scheduled_date: string;  // "2026-06-08"
  scheduled_time: string;  // "13:30:00"
  reason: string | null;
  status: AppointmentStatus;
  origin: AppointmentOrigin;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientResponse {
  id: string;
  document_number: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientCreatePayload {
  document_number: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  phone?: string;
}

export interface AppointmentCreatePayload {
  patient_id: string;
  doctor_id: string;
  scheduled_date: string;
  scheduled_time: string;
  reason?: string;
  origin?: AppointmentOrigin;
}

export interface StaffResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  doctor_profile: {
    id: string;
    staff_id: string;
    medical_license: string;
    specialty_id: string;
    specialty: {
      id: string;
      name: string;
      description: string;
    };
  } | null;
}

export type StaffRole = "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST"

export interface StaffCreatePayload {
  first_name: string
  last_name: string
  email: string
  password: string
  role: StaffRole
  is_active?: boolean
  doctor_profile?: {
    medical_license: string
    specialty_id: string
  }
}

export interface StaffUpdatePayload {
  first_name?: string
  last_name?: string
  email?: string
  is_active?: boolean
}

export interface SpecialtyResponse {
  id: string
  name: string
  description: string
}