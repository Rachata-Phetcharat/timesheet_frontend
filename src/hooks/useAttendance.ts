import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { attendanceApi } from '../api/attendance'
import { ClockInOutPayload } from '../types/attendance'

export const ATTENDANCE_KEYS = {
  all: ['attendance'] as const,
  lists: () => [...ATTENDANCE_KEYS.all, 'list'] as const,
  list: (month?: string) => [...ATTENDANCE_KEYS.lists(), { month }] as const,
  summary: (month?: string) => [...ATTENDANCE_KEYS.all, 'summary', { month }] as const,
  team: (month?: string, dept?: string) => [...ATTENDANCE_KEYS.all, 'team', { month, dept }] as const,
}

export function useAttendanceRecords(month?: string) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.list(month),
    queryFn: () => attendanceApi.getMonthlyRecords(month),
  })
}

export function useAttendanceSummary(month?: string) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.summary(month),
    queryFn: () => attendanceApi.getMonthlySummary(month),
  })
}

export function useClockIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload?: ClockInOutPayload) => attendanceApi.clockIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all })
    },
  })
}

export function useClockOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload?: ClockInOutPayload) => attendanceApi.clockOut(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all })
    },
  })
}

export function useTeamAttendance(month?: string, department?: string) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.team(month, department),
    queryFn: () => attendanceApi.getTeamAttendance(month, department),
  })
}
