export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist'

export interface User {
  email: string
  role: UserRole
  name: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export const TEST_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'admin@valsync.com': {
    password: 'pass123',
    user: { email: 'admin@valsync.com', role: 'admin', name: 'Administrador' },
  },
  'doctor@valsync.com': {
    password: 'pass123',
    user: { email: 'doctor@valsync.com', role: 'doctor', name: 'Doctor' },
  },
  'nurse@valsync.com': {
    password: 'pass123',
    user: { email: 'nurse@valsync.com', role: 'nurse', name: 'Enfermero/a' },
  },
  'reception@valsync.com': {
    password: 'pass123',
    user: { email: 'reception@valsync.com', role: 'receptionist', name: 'Recepcionista' },
  },
}