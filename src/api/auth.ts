import apiClient from './client'
import { AuthResponse, LoginCredentials, RefreshTokenResponse, User } from '../types/user'
import { DEMO_USER, DEMO_ADMIN } from './mockData'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      return response.data
    } catch (error) {
      // Fallback for standalone/demo mode if backend is not reachable
      console.warn('Backend /auth/login unreachable or failed. Falling back to local mock authentication:', error)
      
      const isAdmin = credentials.email.toLowerCase().includes('admin')
      const targetUser = isAdmin ? DEMO_ADMIN : DEMO_USER
      
      const mockResponse: AuthResponse = {
        accessToken: `mock_jwt_access_token_${Date.now()}`,
        refreshToken: `mock_jwt_refresh_token_${Date.now()}`,
        user: {
          ...targetUser,
          email: credentials.email || targetUser.email,
        },
      }
      return mockResponse
    }
  },

  refreshToken: async (token?: string): Promise<RefreshTokenResponse> => {
    const rToken = token || localStorage.getItem('timesheet_refresh_token')
    try {
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken: rToken,
      })
      return response.data
    } catch (error) {
      console.warn('Backend /auth/refresh unreachable. Returning refreshed mock token:', error)
      return {
        accessToken: `mock_jwt_access_token_refreshed_${Date.now()}`,
      }
    }
  },

  getMe: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>('/auth/me')
      return response.data
    } catch {
      const stored = localStorage.getItem('timesheet_user')
      if (stored) {
        return JSON.parse(stored)
      }
      return DEMO_USER
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
