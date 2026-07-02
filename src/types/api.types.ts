export type AppointmentStatus =
  | 'SCHEDULED'
  | 'WAITING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type AppointmentOrigin = 'VALSYNC' | 'VALCARE' | 'WALK_IN';

// -------------------------------------------------------------------
// TRIAGE
// -------------------------------------------------------------------
export interface TriageCreate {
  weight_kg?: number;
  height_cm?: number;
  bmi?: number;
  blood_pressure?: string;
  temperature_c?: number;
  notes?: string;
}

export interface TriageResponse {
  id: string;
  appointment_id: string;
  nurse_id: string;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  blood_pressure: string | null;
  temperature_c: number | null;
  notes: string | null;
  created_at: string;
}

// -------------------------------------------------------------------
// APPOINTMENT
// -------------------------------------------------------------------
export interface AppointmentResponse {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_date: string;
  scheduled_time: string;
  reason: string | null;
  status: AppointmentStatus;
  origin: AppointmentOrigin;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  triage: TriageResponse | null;
  consultation: object | null;
}

// -------------------------------------------------------------------
// AUTH
// -------------------------------------------------------------------
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}