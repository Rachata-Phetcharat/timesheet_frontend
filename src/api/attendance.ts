import apiClient from './client'
import { AttendanceRecord, AttendanceSummary, ClockInOutPayload } from '../types/attendance'


export const attendanceApi = {
  getMonthlyRecords: async (month?: string): Promise<AttendanceRecord[]> => {
    const response = await apiClient.get<any>('/attendance/me', {
      params: { month },
    })
    return (response.data.records || []).map((r: any) => ({
      ...r,
      employeeId: r.employee_id,
      clockInAt: r.clock_in_at,
      clockOutAt: r.clock_out_at,
      lateMinutes: r.late_minutes,
      date: r.clock_in_at ? new Date(r.clock_in_at).toLocaleDateString('en-CA') : undefined
    }))
  },

  getMonthlySummary: async (month?: string): Promise<AttendanceSummary> => {
    const response = await apiClient.get<any>('/attendance/me', {
      params: { month },
    })
    
    const records = (response.data.records || []).map((r: any) => ({
      ...r,
      employeeId: r.employee_id,
      clockInAt: r.clock_in_at,
      clockOutAt: r.clock_out_at,
      lateMinutes: r.late_minutes,
      date: r.clock_in_at ? new Date(r.clock_in_at).toLocaleDateString('en-CA') : undefined
    }))
    
    const todayStr = new Date().toLocaleDateString('en-CA')
    const todayRecord = records.find((r: any) => r.date === todayStr) || null

    let currentStatus: 'not_clocked_in' | 'clocked_in' | 'clocked_out' = 'not_clocked_in'
    if (todayRecord) {
      if (todayRecord.clockInAt && !todayRecord.clockOutAt) {
        currentStatus = 'clocked_in'
      } else if (todayRecord.clockInAt && todayRecord.clockOutAt) {
        currentStatus = 'clocked_out'
      }
    }

    return {
      totalDays: response.data.total_days,
      onTimeCount: response.data.on_time_count,
      lateCount: response.data.late_count,
      absentCount: response.data.absent_count,
      totalLateMinutes: response.data.total_late_minutes || 0,
      leaveCount: 0,
      totalWorkHours: 0,
      currentStatus,
      todayRecord,
    }
  },

  clockIn: async (payload?: ClockInOutPayload): Promise<AttendanceRecord> => {
    const response = await apiClient.post<any>('/attendance/clock-in', payload)
    return {
      ...response.data,
      employeeId: response.data.employee_id,
      clockInAt: response.data.clock_in_at,
      clockOutAt: response.data.clock_out_at,
      lateMinutes: response.data.late_minutes,
      date: response.data.clock_in_at ? response.data.clock_in_at.slice(0, 10) : undefined
    }
  },

  clockOut: async (payload?: ClockInOutPayload): Promise<AttendanceRecord> => {
    const response = await apiClient.post<any>('/attendance/clock-out', payload)
    return {
      ...response.data,
      employeeId: response.data.employee_id,
      clockInAt: response.data.clock_in_at,
      clockOutAt: response.data.clock_out_at,
      lateMinutes: response.data.late_minutes,
      date: response.data.clock_in_at ? response.data.clock_in_at.slice(0, 10) : undefined
    }
  },

  getTeamAttendance: async (month?: string, department?: string): Promise<AttendanceRecord[]> => {
    const response = await apiClient.get<any[]>('/attendance/all', {
      params: { month, department },
    })
    return (response.data || []).map((r: any) => ({
      ...r,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeEmail: r.employee_email,
      clockInAt: r.clock_in_at,
      clockOutAt: r.clock_out_at,
      lateMinutes: r.late_minutes,
      date: r.clock_in_at ? new Date(r.clock_in_at).toLocaleDateString('en-CA') : undefined
    }))
  },
}
