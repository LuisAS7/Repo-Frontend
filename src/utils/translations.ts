export const roleTranslations: Record<string, string> = {
    ADMIN: 'Administrador',
    DOCTOR: 'Médico',
    NURSE: 'Enfermero(a)',
    RECEPTIONIST: 'Recepcionista',
    admin: 'Administrador',
    doctor: 'Médico',
    nurse: 'Enfermero(a)',
    receptionist: 'Recepcionista',
};

export const statusTranslations: Record<string, string> = {
    SCHEDULED: 'Programada',
    WAITING: 'En Espera',
    READY: 'Triaje Listo',
    COMPLETED: 'Completada',
    CANCELED: 'Cancelada',
    CANCELLED: 'Cancelada', 
};

export const originTranslations: Record<string, string> = {
    VALSYNC: 'Recepción',
    VALCARE: 'Portal Paciente',
    WALK_IN: 'Urgencia / Sin Cita',
};

export const genderTranslations: Record<string, string> = {
    MALE: 'Masculino',
    FEMALE: 'Femenino',
    OTHER: 'Otro',
    PREFER_NOT_TO_SAY: 'Prefiero no decirlo',
};

export const bloodTypeTranslations: Record<string, string> = {
    A_POS: 'A+', A_NEG: 'A-',
    B_POS: 'B+', B_NEG: 'B-',
    AB_POS: 'AB+', AB_NEG: 'AB-',
    O_POS: 'O+', O_NEG: 'O-',
};

// Diccionario de catalogos médicos para traducciones
export const catalogTranslations: Record<string, string> = {
    // Especialidades
    'Cardiology': 'Cardiología',
    'Pediatrics': 'Pediatría',
    'Neurology': 'Neurología',
    'General Practice': 'Medicina General',
    'Dermatology': 'Dermatología',
    'Psychiatry': 'Psiquiatría',
    'Orthopedics': 'Ortopedia',
    'Gynecology': 'Ginecología',
    // Alergias
    'Penicillin': 'Penicilina',
    'Peanuts': 'Maní / Cacahuates',
    'Latex': 'Látex',
    'Pollen': 'Polen',
    'Dust Mites': 'Ácaros del polvo',
    // Enfermedades
    'Type 2 Diabetes': 'Diabetes Tipo 2',
    'Hypertension': 'Hipertensión',
    'Asthma': 'Asma',
    'Hypothyroidism': 'Hipotiroidismo',
};

// Traductores de errores del backend
export const translateBackendError = (errorDetail: string | any): string => {
    if (!errorDetail || typeof errorDetail !== 'string') return 'Ocurrió un error inesperado.';

    const detail = errorDetail.toLowerCase();

    // Errores de Autenticación
    if (detail.includes('invalid email or password')) return 'Correo o contraseña incorrectos.';
    
    // Errores de Conflicto (Duplicados)
    if (detail.includes('already registered in the system')) return 'Este correo electrónico ya se encuentra registrado.';
    if (detail.includes('document number') && detail.includes('already registered')) return 'El número de documento ya está registrado en el sistema.';
    if (detail.includes('already booked')) return 'El horario seleccionado ya está reservado para este médico.';
    
    // Errores de Validación
    if (detail.includes('past appointment') || detail.includes('in the past')) return 'No se pueden programar citas en fechas u horas pasadas.';
    if (detail.includes('transition appointment from')) return 'No se puede cambiar la cita a ese estado actualmente.';
    if (detail.includes('do not exist in the database')) return 'Algunos de los datos de catálogo seleccionados no son válidos.';
    
    // Errores de No Encontrado (404)
    if (detail.includes('staff member') && detail.includes('not found')) return 'El miembro del personal no fue encontrado.';
    if (detail.includes('patient') && detail.includes('not found')) return 'El paciente indicado no fue encontrado.';
    if (detail.includes('appointment') && detail.includes('not found')) return 'La cita indicada no fue encontrada.';

  // Fallback genérico
  return errorDetail; // Si es un error desconocido, mostramos el original
};

// Helpers para traducciones de especialidades médicas
export const t = {
    role: (key: string) => roleTranslations[key] || key,
    status: (key: string) => statusTranslations[key] || key,
    origin: (key: string) => originTranslations[key] || key,
    gender: (key: string) => genderTranslations[key] || key,
    blood: (key: string) => bloodTypeTranslations[key] || key,
    catalog: (key: string) => catalogTranslations[key] || key,
    error: translateBackendError,
};