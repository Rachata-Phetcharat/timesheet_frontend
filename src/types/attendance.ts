export type AttendanceStatus = 'on_time' | 'late' | 'absent'

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName?: string
  date?: string
  clockInAt: string | null
  clockOutAt: string | null
  status: AttendanceStatus
  lateMinutes: number | null
  notes?: string
  workHours?: number | null
}

export interface AttendanceSummary {
  totalDays: number
  onTimeCount: number
  lateCount: number
  absentCount: number
  leaveCount: number
  totalWorkHours: number
  currentStatus: 'not_clocked_in' | 'clocked_in' | 'clocked_out'
  todayRecord: AttendanceRecord | null
}

export interface ClockInOutPayload {
  notes?: string
  location?: {
    latitude?: number
    longitude?: number
  }
}
