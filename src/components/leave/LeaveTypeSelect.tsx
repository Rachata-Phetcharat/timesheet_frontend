import React from 'react'
import { LeaveType } from '../../types/leave'
import { Select, SelectProps } from '../ui/select'

interface LeaveTypeSelectProps extends Omit<SelectProps, 'options' | 'value' | 'onChange'> {
  value?: LeaveType
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const LEAVE_TYPE_OPTIONS = [
  { value: 'personal', label: 'ลากิจ (Personal Leave)' },
  { value: 'sick', label: 'ลาป่วย (Sick Leave)' },
  { value: 'vacation', label: 'ลาพักร้อน (Annual Vacation)' },
]

export const LeaveTypeSelect: React.FC<LeaveTypeSelectProps> = (props) => {
  return <Select label="ประเภทการลา" options={LEAVE_TYPE_OPTIONS} {...props} />
}
