export interface Patient {
  firstName: string;
  lastName: string;
  documentNumber?: string;
  medicalBackground?: {
    bloodType: string;
    allergies: string[];
    chronicDiseases: string[];
  };
  triage?: {
    weightKg: number;
    heightCm: number;
    bmi: number;
    bloodPressure: string;
    temperatureC: number;
  };
}

export interface Appointment {
  id: number;
  time: string;
  patient: Patient;
  reason: string;
  status: 'READY' | 'WAITING' | 'COMPLETED';
}

export interface Prescription {
  medication: string;
  dose: string;
  frequency: string;
  durationDays: string;
}

export interface ConsultationHistory {
  id: number;
  date: string;
  diagnosisCie10: string;
  plan: string;
  prescriptions: string[];
}

export interface ConsultationRecord {
  appointmentId: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions: Prescription[];
  date: string;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    time: "08:30 AM",
    patient: { 
      firstName: "Carlos", 
      lastName: "Mendoza",
      documentNumber: "11223344-5",
      medicalBackground: { bloodType: "A+", allergies: [], chronicDiseases: ["Hipertensión"] },
      triage: { weightKg: 80, heightCm: 175, bmi: 26.1, bloodPressure: "130/85", temperatureC: 36.5 }
    },
    reason: "Control hipertensión anual",
    status: "READY",
  },
  {
    id: 2,
    time: "09:15 AM",
    patient: { 
      firstName: "María", 
      lastName: "González",
      documentNumber: "12345678-9",
      medicalBackground: { bloodType: "O+", allergies: ["Penicilina", "Látex"], chronicDiseases: ["Asma leve"] },
      triage: { weightKg: 65, heightCm: 165, bmi: 23.9, bloodPressure: "120/80", temperatureC: 37.1 }
    },
    reason: "Dolor abdominal agudo",
    status: "WAITING",
  },
  {
    id: 3,
    time: "10:00 AM",
    patient: { 
      firstName: "Juan", 
      lastName: "Pérez",
      documentNumber: "87654321-0",
      medicalBackground: { bloodType: "B-", allergies: [], chronicDiseases: [] },
      triage: { weightKg: 75, heightCm: 170, bmi: 25.9, bloodPressure: "110/70", temperatureC: 36.7 }
    },
    reason: "Revisión post-operatoria",
    status: "COMPLETED", 
  },
  {
    id: 4,
    time: "11:30 AM",
    patient: { 
      firstName: "Ana", 
      lastName: "Martínez",
      documentNumber: "44556677-8",
      medicalBackground: { bloodType: "AB+", allergies: ["Ibuprofeno"], chronicDiseases: ["Migraña crónica"] },
      triage: { weightKg: 60, heightCm: 160, bmi: 23.4, bloodPressure: "115/75", temperatureC: 36.8 }
    },
    reason: "Consulta general - Migraña",
    status: "READY",
  },
];

const INITIAL_HISTORY: Record<string, ConsultationHistory[]> = {
  "12345678-9": [
    {
      id: 1,
      date: "12 Oct 2023",
      diagnosisCie10: "J45.9 - Asma, no especificada",
      plan: "Continuar con inhalador de rescate. Evitar exposición a alérgenos conocidos. Control en 3 meses.",
      prescriptions: ["Salbutamol 100mcg - 2 puffs SOS"]
    },
    {
      id: 2,
      date: "05 Ene 2023",
      diagnosisCie10: "J06.9 - Infección aguda de las vías respiratorias superiores",
      plan: "Reposo relativo, abundante hidratación. Uso de antipiréticos si hay fiebre mayor a 38°C.",
      prescriptions: ["Paracetamol 500mg - 1 tab c/8h", "Loratadina 10mg - 1 tab c/24h"]
    }
  ]
};

const APPOINTMENTS_KEY = 'valsync_doctor_appointments';
const CONSULTATIONS_KEY = 'valsync_doctor_consultations';
const HISTORY_KEY = 'valsync_doctor_history';

export const storageService = {
  // Appointments
  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem(APPOINTMENTS_KEY);
    if (!data) {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(data);
  },

  getAppointmentById: (id: number): Appointment | undefined => {
    const appointments = storageService.getAppointments();
    return appointments.find(a => a.id === id);
  },

  updateAppointmentStatus: (id: number, status: Appointment['status']): void => {
    const appointments = storageService.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index].status = status;
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    }
  },

  // Consultations
  saveConsultation: (record: ConsultationRecord): void => {
    const data = localStorage.getItem(CONSULTATIONS_KEY);
    const consultations: ConsultationRecord[] = data ? JSON.parse(data) : [];
    consultations.push(record);
    localStorage.setItem(CONSULTATIONS_KEY, JSON.stringify(consultations));

    // Update appointment status to COMPLETED
    storageService.updateAppointmentStatus(record.appointmentId, 'COMPLETED');
  },

  // History
  getPatientHistory: (documentNumber: string): ConsultationHistory[] => {
    const data = localStorage.getItem(HISTORY_KEY);
    let historyMap: Record<string, ConsultationHistory[]> = {};
    
    if (!data) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(INITIAL_HISTORY));
      historyMap = INITIAL_HISTORY;
    } else {
      historyMap = JSON.parse(data);
    }

    return historyMap[documentNumber] || [];
  }
};
