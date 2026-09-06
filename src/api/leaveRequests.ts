import apiClient from './client'
import { CreateLeaveRequestInput, LeaveRequest, LeaveStatus } from '../types/leave'

const mapLeaveRequest = (r: any): LeaveRequest => ({
  id: r.id,
  employeeId: r.employee_id,
  employeeName: r.employee?.full_name || undefined,
  type: r.type,
  duration: r.duration || 'full_day',
  startDate: r.start_date,
  endDate: r.end_date,
  reason: r.reason,
  status: r.status,
  createdAt: r.created_at,
  approverName: r.approver_name, // If backend supports it
  approverComment: r.approver_comment,
})

export const leaveRequestsApi = {
  getMyLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const response = await apiClient.get<any[]>('/leave-requests/me')
    return response.data.map(mapLeaveRequest)
  },

  getAllLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const response = await apiClient.get<any[]>('/leave-requests')
    return response.data.map(mapLeaveRequest)
  },

  getLeaveRequestById: async (id: string): Promise<LeaveRequest> => {
    const response = await apiClient.get<any>(`/leave-requests/${id}`)
    return mapLeaveRequest(response.data)
  },

  createLeaveRequest: async (input: CreateLeaveRequestInput): Promise<LeaveRequest> => {
    const payload = {
      type: input.type,
      duration: input.duration,
      start_date: input.startDate,
      end_date: input.endDate,
      reason: input.reason,
    }
    const response = await apiClient.post<any>('/leave-requests', payload)
    return mapLeaveRequest(response.data)
  },

  updateLeaveStatus: async (id: string, status: LeaveStatus, comment?: string): Promise<LeaveRequest> => {
    const response = await apiClient.patch<any>(`/leave-requests/${id}/status`, {
      status,
    })
    return mapLeaveRequest(response.data)
  },

  cancelLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await apiClient.patch<any>(`/leave-requests/${id}/cancel`)
    return mapLeaveRequest(response.data)
  },
}
