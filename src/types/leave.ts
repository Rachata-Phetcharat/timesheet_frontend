export type LeaveType = 'personal' | 'sick' | 'vacation'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type LeaveDuration = 'full_day' | 'morning' | 'afternoon'

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName?: string
  type: LeaveType
  duration: LeaveDuration
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
  duration: LeaveDuration
  startDate: string
  endDate: string
  reason: string
}
