import apiClient from './client'
import { CreateLeaveRequestInput, LeaveRequest, LeaveStatus } from '../types/leave'
import { INITIAL_LEAVE_REQUESTS } from './mockData'

const LOCAL_STORAGE_LEAVE_KEY = 'timesheet_leave_requests'

function getStoredLeaves(): LeaveRequest[] {
  const data = localStorage.getItem(LOCAL_STORAGE_LEAVE_KEY)
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_LEAVE_KEY, JSON.stringify(INITIAL_LEAVE_REQUESTS))
    return INITIAL_LEAVE_REQUESTS
  }
  try {
    return JSON.parse(data)
  } catch {
    return INITIAL_LEAVE_REQUESTS
  }
}

function saveStoredLeaves(leaves: LeaveRequest[]) {
  localStorage.setItem(LOCAL_STORAGE_LEAVE_KEY, JSON.stringify(leaves))
}

export const leaveRequestsApi = {
  getMyLeaveRequests: async (): Promise<LeaveRequest[]> => {
    try {
      const response = await apiClient.get<LeaveRequest[]>('/leave-requests/me')
      return response.data
    } catch (error) {
      console.warn('Backend /leave-requests/me unreachable, loading local storage cache:', error)
      return getStoredLeaves()
    }
  },

  getAllLeaveRequests: async (): Promise<LeaveRequest[]> => {
    try {
      const response = await apiClient.get<LeaveRequest[]>('/leave-requests')
      return response.data
    } catch {
      return getStoredLeaves()
    }
  },

  getLeaveRequestById: async (id: string): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.get<LeaveRequest>(`/leave-requests/${id}`)
      return response.data
    } catch {
      const leaves = getStoredLeaves()
      const found = leaves.find((item) => item.id === id)
      if (!found) throw new Error('Leave request not found')
      return found
    }
  },

  createLeaveRequest: async (input: CreateLeaveRequestInput): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.post<LeaveRequest>('/leave-requests', input)
      return response.data
    } catch (error) {
      console.warn('Backend /leave-requests unreachable, saving locally:', error)
      const leaves = getStoredLeaves()
      const newLeave: LeaveRequest = {
        id: `lv-${Date.now()}`,
        employeeId: 'EMP-2026-08',
        employeeName: 'สมชาย ใจดี',
        type: input.type,
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      leaves.unshift(newLeave)
      saveStoredLeaves(leaves)
      return newLeave
    }
  },

  updateLeaveStatus: async (id: string, status: LeaveStatus, comment?: string): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.patch<LeaveRequest>(`/leave-requests/${id}/status`, {
        status,
        approverComment: comment,
      })
      return response.data
    } catch {
      const leaves = getStoredLeaves()
      const index = leaves.findIndex((l) => l.id === id)
      if (index === -1) throw new Error('Leave request not found')
      
      const updated: LeaveRequest = {
        ...leaves[index],
        status,
        approverName: 'วราภรณ์ มั่นคง (HR Admin)',
        approverComment: comment || (status === 'approved' ? 'อนุมัติเรียบร้อย' : 'ไม่อนุมัติคำขอ'),
      }
      leaves[index] = updated
      saveStoredLeaves(leaves)
      return updated
    }
  },
}
