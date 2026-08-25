import React from 'react'
import { LeaveStatus } from '../../types/leave'
import { Badge } from '../ui/badge'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'

interface LeaveStatusBadgeProps {
  status: LeaveStatus
}

export const LeaveStatusBadge: React.FC<LeaveStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="warning" className="gap-1 px-2.5 py-1">
          <Clock className="h-3.5 w-3.5" />
          <span>รออนุมัติ</span>
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant="success" className="gap-1 px-2.5 py-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>อนุมัติแล้ว</span>
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="destructive" className="gap-1 px-2.5 py-1">
          <XCircle className="h-3.5 w-3.5" />
          <span>ไม่อนุมัติ</span>
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}
