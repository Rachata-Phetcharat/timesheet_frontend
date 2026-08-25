export type UserRole = 'employee' | 'admin' | 'manager'

export interface User {
  id: string
  employeeId: string
  name: string
  email: string
  role: UserRole
  department?: string
  position?: string
  avatarUrl?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken?: string
}
