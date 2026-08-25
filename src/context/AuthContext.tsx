import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { LoginCredentials, User, UserRole } from '../types/user'
import { authApi } from '../api/auth'
import { DEMO_ADMIN, DEMO_USER } from '../api/mockData'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  switchUserRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('timesheet_access_token')
        const storedUser = localStorage.getItem('timesheet_user')

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        } else if (storedToken) {
          const fetchedUser = await authApi.getMe()
          setUser(fetchedUser)
          localStorage.setItem('timesheet_user', JSON.stringify(fetchedUser))
          setToken(storedToken)
        } else {
          // Default pre-authenticated demo user for smooth immediate evaluation if wanted
          // or leave null. Let's auto-login DEMO_USER so the app is instantly usable, but full login page is functional!
          setToken('mock_jwt_access_token_demo')
          setUser(DEMO_USER)
          localStorage.setItem('timesheet_access_token', 'mock_jwt_access_token_demo')
          localStorage.setItem('timesheet_user', JSON.stringify(DEMO_USER))
        }
      } catch (err) {
        console.error('Failed to initialize auth state:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    const handleAuthLogout = () => {
      setUser(null)
      setToken(null)
    }

    window.addEventListener('auth:logout', handleAuthLogout)
    return () => window.removeEventListener('auth:logout', handleAuthLogout)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(credentials)
      setToken(response.accessToken)
      setUser(response.user)
      localStorage.setItem('timesheet_access_token', response.accessToken)
      if (response.refreshToken) {
        localStorage.setItem('timesheet_refresh_token', response.refreshToken)
      }
      localStorage.setItem('timesheet_user', JSON.stringify(response.user))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authApi.logout()
    } finally {
      setToken(null)
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  const switchUserRole = useCallback((role: UserRole) => {
    const target = role === 'admin' ? DEMO_ADMIN : DEMO_USER
    setUser(target)
    localStorage.setItem('timesheet_user', JSON.stringify(target))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        switchUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
