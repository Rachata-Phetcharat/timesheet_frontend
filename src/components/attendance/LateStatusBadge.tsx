import React from 'react'
import { AttendanceStatus } from '../../types/attendance'
import { Badge } from '../ui/badge'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

interface LateStatusBadgeProps {
  status: AttendanceStatus
  lateMinutes?: number | null
}

export const LateStatusBadge: React.FC<LateStatusBadgeProps> = ({ status, lateMinutes }) => {
  switch (status) {
    case 'on_time':
      return (
        <Badge variant="success" className="gap-1 px-2.5 py-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>ตรงเวลา</span>
        </Badge>
      )
    case 'late':
      return (
        <Badge variant="warning" className="gap-1 px-2.5 py-1">
          <Clock className="h-3.5 w-3.5" />
          <span>สาย {lateMinutes ? `${lateMinutes} นาที` : ''}</span>
        </Badge>
      )
    case 'absent':
      return (
        <Badge variant="destructive" className="gap-1 px-2.5 py-1">
          <XCircle className="h-3.5 w-3.5" />
          <span>ขาดงาน</span>
        </Badge>
      )
    default:
      return <Badge variant="secondary">-</Badge>
  }
}
