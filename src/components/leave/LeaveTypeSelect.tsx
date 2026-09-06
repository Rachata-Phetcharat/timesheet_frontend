import React from 'react'
import { LeaveType } from '../../types/leave'
import { Select, SelectProps } from '../ui/select'

interface LeaveTypeSelectProps extends Omit<SelectProps, 'options' | 'value' | 'onChange'> {
  value?: LeaveType
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const LEAVE_TYPE_OPTIONS = [
  { value: 'personal', label: 'ลากิจ' },
  { value: 'sick', label: 'ลาป่วย' },
  { value: 'vacation', label: 'ลาพักร้อน' },
]

export const LeaveTypeSelect: React.FC<LeaveTypeSelectProps> = (props) => {
  return <Select label="ประเภทการลา" options={LEAVE_TYPE_OPTIONS} {...props} />
}
