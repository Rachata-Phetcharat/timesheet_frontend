import React from 'react'
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { AttendancePage } from '../pages/AttendancePage'
import { LeaveRequestPage } from '../pages/LeaveRequestPage'
import { AdminReportPage } from '../pages/AdminReportPage'

import { TeamAttendancePage } from '../pages/TeamAttendancePage'

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// Public Route Guard (Prevent logged in users from seeing login page)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Employee Route Guard
const EmployeeRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return <Navigate to="/admin/reports" replace />
  }

  return <>{children}</>
}

// Admin Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center space-y-3">
        <h3 className="text-lg font-bold text-rose-900">ไม่มีสิทธิ์เข้าถึงหน้านี้ (Admin Only)</h3>
        <p className="text-sm text-rose-700">
          หน้านี้สงวนสิทธิ์สำหรับฝ่ายทรัพยากรบุคคล (HR) หรือผู้ดูแลระบบเท่านั้น
        </p>
      </div>
    )
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <EmployeeRoute>
            <DashboardPage />
          </EmployeeRoute>
        ),
      },
      {
        path: 'attendance',
        element: (
          <EmployeeRoute>
            <AttendancePage />
          </EmployeeRoute>
        ),
      },
      {
        path: 'leave-requests',
        element: (
          <EmployeeRoute>
            <LeaveRequestPage />
          </EmployeeRoute>
        ),
      },
      {
        path: 'team-attendance',
        element: (
          <EmployeeRoute>
            <TeamAttendancePage />
          </EmployeeRoute>
        ),
      },
      {
        path: 'admin/reports',
        element: (
          <AdminRoute>
            <AdminReportPage />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
