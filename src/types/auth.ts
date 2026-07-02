export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}