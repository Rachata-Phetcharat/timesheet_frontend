export type LeaveType = 'personal' | 'sick' | 'vacation'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName?: string
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  createdAt?: string
  approverName?: string
  approverComment?: string
}

export interface CreateLeaveRequestInput {
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
}
