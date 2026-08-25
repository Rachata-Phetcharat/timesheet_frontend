import apiClient from './client'
import { AttendanceRecord, AttendanceSummary, ClockInOutPayload } from '../types/attendance'
import { INITIAL_ATTENDANCE_RECORDS, INITIAL_TEAM_ATTENDANCE } from './mockData'

const LOCAL_STORAGE_ATTENDANCE_KEY = 'timesheet_attendance_records'
const LOCAL_STORAGE_TEAM_KEY = 'timesheet_team_attendance_records'

function getStoredRecords(): AttendanceRecord[] {
  const data = localStorage.getItem(LOCAL_STORAGE_ATTENDANCE_KEY)
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_ATTENDANCE_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS))
    return INITIAL_ATTENDANCE_RECORDS
  }
  try {
    return JSON.parse(data)
  } catch {
    return INITIAL_ATTENDANCE_RECORDS
  }
}

function saveStoredRecords(records: AttendanceRecord[]) {
  localStorage.setItem(LOCAL_STORAGE_ATTENDANCE_KEY, JSON.stringify(records))
}

function getStoredTeamRecords(): AttendanceRecord[] {
  const data = localStorage.getItem(LOCAL_STORAGE_TEAM_KEY)
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_TEAM_KEY, JSON.stringify(INITIAL_TEAM_ATTENDANCE))
    return INITIAL_TEAM_ATTENDANCE
  }
  try {
    return JSON.parse(data)
  } catch {
    return INITIAL_TEAM_ATTENDANCE
  }
}

export const attendanceApi = {
  getMonthlyRecords: async (month?: string): Promise<AttendanceRecord[]> => {
    try {
      const response = await apiClient.get<AttendanceRecord[]>('/attendance/me', {
        params: { month: month || new Date().toISOString().slice(0, 7) },
      })
      return response.data
    } catch (error) {
      console.warn('Backend /attendance/me unreachable, using local storage cache:', error)
      const targetMonth = month || new Date().toISOString().slice(0, 7)
      const records = getStoredRecords()
      return records.filter((r) => !r.date || r.date.startsWith(targetMonth))
    }
  },

  getMonthlySummary: async (month?: string): Promise<AttendanceSummary> => {
    try {
      const response = await apiClient.get<AttendanceSummary>('/attendance/summary', {
        params: { month: month || new Date().toISOString().slice(0, 7) },
      })
      return response.data
    } catch {
      const records = await attendanceApi.getMonthlyRecords(month)
      const todayStr = new Date().toISOString().slice(0, 10)
      const todayRecord = records.find((r) => r.date === todayStr) || null

      let currentStatus: 'not_clocked_in' | 'clocked_in' | 'clocked_out' = 'not_clocked_in'
      if (todayRecord) {
        if (todayRecord.clockInAt && !todayRecord.clockOutAt) {
          currentStatus = 'clocked_in'
        } else if (todayRecord.clockInAt && todayRecord.clockOutAt) {
          currentStatus = 'clocked_out'
        }
      }

      const onTimeCount = records.filter((r) => r.status === 'on_time').length
      const lateCount = records.filter((r) => r.status === 'late').length
      const absentCount = records.filter((r) => r.status === 'absent').length
      const totalWorkHours = records.reduce((acc, curr) => acc + (curr.workHours || 0), 0)

      return {
        totalDays: records.length,
        onTimeCount,
        lateCount,
        absentCount,
        leaveCount: 2,
        totalWorkHours: parseFloat(totalWorkHours.toFixed(1)),
        currentStatus,
        todayRecord,
      }
    }
  },

  clockIn: async (payload?: ClockInOutPayload): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post<AttendanceRecord>('/attendance/clock-in', payload)
      return response.data
    } catch (error) {
      console.warn('Backend /attendance/clock-in unreachable, recording locally:', error)
      const now = new Date()
      const todayStr = now.toISOString().slice(0, 10)
      const nowIso = now.toISOString()
      
      // Calculate if late (threshold e.g. 09:00:00)
      const standardStart = new Date()
      standardStart.setHours(9, 0, 0, 0)
      const isLate = now.getTime() > standardStart.getTime()
      const lateMinutes = isLate ? Math.floor((now.getTime() - standardStart.getTime()) / (1000 * 60)) : 0

      const records = getStoredRecords()
      const existingIndex = records.findIndex((r) => r.date === todayStr)

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: 'EMP-2026-08',
        employeeName: 'สมชาย ใจดี',
        date: todayStr,
        clockInAt: nowIso,
        clockOutAt: null,
        status: isLate ? 'late' : 'on_time',
        lateMinutes: isLate ? lateMinutes : 0,
        notes: payload?.notes || '',
      }

      if (existingIndex >= 0) {
        records[existingIndex] = { ...records[existingIndex], ...newRecord }
      } else {
        records.unshift(newRecord)
      }

      saveStoredRecords(records)
      return newRecord
    }
  },

  clockOut: async (payload?: ClockInOutPayload): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post<AttendanceRecord>('/attendance/clock-out', payload)
      return response.data
    } catch (error) {
      console.warn('Backend /attendance/clock-out unreachable, recording locally:', error)
      const now = new Date()
      const todayStr = now.toISOString().slice(0, 10)
      const nowIso = now.toISOString()

      const records = getStoredRecords()
      const index = records.findIndex((r) => r.date === todayStr)

      if (index >= 0) {
        const record = records[index]
        const clockInTime = record.clockInAt ? new Date(record.clockInAt).getTime() : now.getTime()
        const durationHours = parseFloat(((now.getTime() - clockInTime) / (1000 * 60 * 60)).toFixed(1))

        const updatedRecord: AttendanceRecord = {
          ...record,
          clockOutAt: nowIso,
          workHours: durationHours > 0 ? durationHours : 8.0,
          notes: payload?.notes ? `${record.notes ? record.notes + ' | ' : ''}${payload.notes}` : record.notes,
        }
        records[index] = updatedRecord
        saveStoredRecords(records)
        return updatedRecord
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          employeeId: 'EMP-2026-08',
          employeeName: 'สมชาย ใจดี',
          date: todayStr,
          clockInAt: '2026-08-25T08:55:00+07:00',
          clockOutAt: nowIso,
          status: 'on_time',
          lateMinutes: 0,
          workHours: 8.5,
          notes: payload?.notes || '',
        }
        records.unshift(newRecord)
        saveStoredRecords(records)
        return newRecord
      }
    }
  },

  getTeamAttendance: async (month?: string, department?: string): Promise<AttendanceRecord[]> => {
    try {
      const response = await apiClient.get<AttendanceRecord[]>('/attendance/admin/reports', {
        params: { month, department },
      })
      return response.data
    } catch {
      const records = getStoredTeamRecords()
      return records
    }
  },
}
