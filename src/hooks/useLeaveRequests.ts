import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leaveRequestsApi } from '../api/leaveRequests'
import { CreateLeaveRequestInput, LeaveStatus } from '../types/leave'

export const LEAVE_KEYS = {
  all: ['leaveRequests'] as const,
  mine: () => [...LEAVE_KEYS.all, 'mine'] as const,
  list: () => [...LEAVE_KEYS.all, 'list'] as const,
  detail: (id: string) => [...LEAVE_KEYS.all, 'detail', id] as const,
}

export function useMyLeaveRequests() {
  return useQuery({
    queryKey: LEAVE_KEYS.mine(),
    queryFn: () => leaveRequestsApi.getMyLeaveRequests(),
  })
}

export function useAllLeaveRequests() {
  return useQuery({
    queryKey: LEAVE_KEYS.list(),
    queryFn: () => leaveRequestsApi.getAllLeaveRequests(),
  })
}

export function useLeaveRequestById(id: string) {
  return useQuery({
    queryKey: LEAVE_KEYS.detail(id),
    queryFn: () => leaveRequestsApi.getLeaveRequestById(id),
    enabled: !!id,
  })
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLeaveRequestInput) => leaveRequestsApi.createLeaveRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.all })
    },
  })
}

export function useUpdateLeaveStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: LeaveStatus; comment?: string }) =>
      leaveRequestsApi.updateLeaveStatus(id, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.all })
    },
  })
}
