import apiClient from './client'
import { AuthResponse, LoginCredentials, RefreshTokenResponse, User } from '../types/user'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/login', credentials)
    
    const accessToken = response.data.access_token
    const refreshToken = response.data.refresh_token
    localStorage.setItem('timesheet_access_token', accessToken)
    if (refreshToken) {
      localStorage.setItem('timesheet_refresh_token', refreshToken)
    }

    const userResponse = await apiClient.get<any>('/auth/me')
    
    return {
      accessToken,
      refreshToken,
      user: {
        ...userResponse.data,
        name: userResponse.data.full_name || userResponse.data.name,
        employeeId: userResponse.data.employee_id || userResponse.data.id,
      },
    }
  },

  refreshToken: async (token?: string): Promise<RefreshTokenResponse> => {
    const rToken = token || localStorage.getItem('timesheet_refresh_token')
    const response = await apiClient.post<any>('/auth/refresh', {
      refresh_token: rToken,
    })
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    }
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<any>('/auth/me')
    return {
      ...response.data,
      name: response.data.full_name || response.data.name,
      employeeId: response.data.employee_id || response.data.id,
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('timesheet_access_token')
      localStorage.removeItem('timesheet_refresh_token')
      localStorage.removeItem('timesheet_user')
    }
  },
}
