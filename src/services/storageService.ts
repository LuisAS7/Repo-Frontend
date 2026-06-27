export interface Patient {
  firstName: string;
  lastName: string;
  age?: number;
  documentNumber?: string;
  phone?: string;
  lastVisit?: string;
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
  date: string;
  time: string;
  patient: Patient;
  reason: string;
  doctor: string;
  status: 'SCHEDULED' | 'READY' | 'WAITING' | 'COMPLETED' | 'CANCELED';
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

export interface Staff {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  specialty?: string;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    date: "2026-04-30",
    time: "08:30 AM",
    patient: { 
      firstName: "Carlos", 
      lastName: "Mendoza",
      documentNumber: "11223344-5",
      medicalBackground: { bloodType: "A+", allergies: [], chronicDiseases: ["Hipertensión"] },
      triage: { weightKg: 80, heightCm: 175, bmi: 26.1, bloodPressure: "130/85", temperatureC: 36.5 }
    },
    reason: "Control hipertensión anual",
    doctor: "Dr. Torres",
    status: "READY",
  },
  {
    id: 2,
    date: "2026-04-30",
    time: "09:15 AM",
    patient: { 
      firstName: "María", 
      lastName: "González",
      age: 28,
      documentNumber: "12345678-9",
      medicalBackground: { bloodType: "O+", allergies: ["Penicilina", "Látex"], chronicDiseases: ["Asma leve"] },
      triage: { weightKg: 65, heightCm: 165, bmi: 23.9, bloodPressure: "120/80", temperatureC: 37.1 }
    },
    reason: "Dolor abdominal agudo",
    doctor: "Dr. Torres",
    status: "WAITING",
  },
  {
    id: 3,
    date: "2026-04-30",
    time: "10:00 AM",
    patient: { 
      firstName: "Juan", 
      lastName: "Pérez",
      documentNumber: "87654321-0",
      medicalBackground: { bloodType: "B-", allergies: [], chronicDiseases: [] },
      triage: { weightKg: 75, heightCm: 170, bmi: 25.9, bloodPressure: "110/70", temperatureC: 36.7 }
    },
    reason: "Revisión post-operatoria",
    doctor: "Dr. Torres",
    status: "COMPLETED", 
  },
  {
    id: 4,
    date: "2026-05-01",
    time: "11:30 AM",
    patient: { 
      firstName: "Ana", 
      lastName: "Martínez",
      documentNumber: "44556677-8",
      medicalBackground: { bloodType: "AB+", allergies: ["Ibuprofeno"], chronicDiseases: ["Migraña crónica"] },
      triage: { weightKg: 60, heightCm: 160, bmi: 23.4, bloodPressure: "115/75", temperatureC: 36.8 }
    },
    reason: "Consulta general - Migraña",
    doctor: "Dr. Torres",
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

const INITIAL_STAFF: Staff[] = [
  { id: 1, name: "Carlos Mendoza", email: "admin@valsync.com", role: "Admin", active: true },
  { id: 2, name: "Dr. Torres", email: "torres@valsync.com", role: "Doctor", active: true, specialty: "Medicina General" },
  { id: 3, name: "Dra. Ruiz", email: "ruiz@valsync.com", role: "Doctor", active: true, specialty: "Pediatría" },
  { id: 4, name: "Dr. Burke", email: "burke@valsync.com", role: "Doctor", active: true, specialty: "Cardiología" },
  { id: 5, name: "Dra. Fernández", email: "fernandez@valsync.com", role: "Doctor", active: true, specialty: "Dermatología" },
  { id: 6, name: "Dr. Shepard", email: "shepard@valsync.com", role: "Doctor", active: true, specialty: "Neurología" },
  { id: 7, name: "Sofia Castro", email: "nurse@valsync.com", role: "Nurse", active: true },
  { id: 8, name: "Miguel Ángel", email: "recepcion@valsync.com", role: "Receptionist", active: true },
];

const STAFF_KEY = 'valsync_admin_staff';
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

    //Update patient history
    const appointment = storageService.getAppointmentById(record.appointmentId);
    
    if (appointment && appointment.patient.documentNumber) {
      const docNumber = appointment.patient.documentNumber;
      
      // Obtain existing history map or initialize it if not present
      const historyData = localStorage.getItem(HISTORY_KEY);
      const historyMap: Record<string, ConsultationHistory[]> = historyData ? JSON.parse(historyData) : {};
      
      if (!historyMap[docNumber]) {
        historyMap[docNumber] = [];
      }

      // Convert the consultation record into a history entry
      const newHistoryEntry: ConsultationHistory = {
        id: Date.now(), // Unique ID based on timestamp
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        diagnosisCie10: record.assessment,
        plan: record.plan,
        prescriptions: record.prescriptions.map(p => `${p.medication} ${p.dose} - ${p.frequency}`)
      };

      historyMap[docNumber].unshift(newHistoryEntry);
      
      // Save the updated history map back to localStorage
      localStorage.setItem(HISTORY_KEY, JSON.stringify(historyMap));
    }
  },

  // History
  getPatientHistory: (documentNumber: string): ConsultationHistory[] => {
    const data = localStorage.getItem(HISTORY_KEY);
    let historyMap: Record<string, ConsultationHistory[]>;
    
    if (!data) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(INITIAL_HISTORY));
      historyMap = INITIAL_HISTORY;
    } else {
      historyMap = JSON.parse(data);
    }

    return historyMap[documentNumber] || [];
  },

  // --- RECEPCTION ---

  // Add new appointment
  addAppointment: (appointment: Appointment): void => {
    const appointments = storageService.getAppointments();
    appointments.push(appointment);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  },

  // Obtain unique patient directory from appointments
  getPatientsDirectory: (): Patient[] => {
    const appointments = storageService.getAppointments();
    const uniquePatientsMap = new Map<string, Patient>();
    
    appointments.forEach(appt => {
      if (appt.patient.documentNumber) {
        uniquePatientsMap.set(appt.patient.documentNumber, appt.patient);
      }
    });
    
    return Array.from(uniquePatientsMap.values());
  },

  // NURSE //
  saveTriage: (appointmentId: number, triageData: Patient['triage']): void => {
    const appointments = storageService.getAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);
    
    if (index !== -1) {
      // Save triage data in the appointment's patient record
      appointments[index].patient.triage = triageData;
      // Change status to READY after triage is completed
      appointments[index].status = 'READY';
      
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    }
  },

  // ADMIN //
  getStaff: (): Staff[] => {
    const data = localStorage.getItem(STAFF_KEY);
    if (!data) {
      localStorage.setItem(STAFF_KEY, JSON.stringify(INITIAL_STAFF));
      return INITIAL_STAFF;
    }
    return JSON.parse(data);
  },

  addStaff: (employee: Staff): void => {
      const staff = storageService.getStaff();
      staff.push(employee);
      localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
  },

  toggleStaffStatus: (id: number): void => {
      const staff = storageService.getStaff();
      const index = staff.findIndex(s => s.id === id);
      if (index !== -1) {
        staff[index].active = !staff[index].active;
        localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
      }
  }
};
