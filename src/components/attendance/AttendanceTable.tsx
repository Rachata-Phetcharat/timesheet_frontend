import React, { useState } from 'react'
import { AttendanceRecord } from '../../types/attendance'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { LateStatusBadge } from './LateStatusBadge'
import { formatDate, formatTime } from '../../lib/utils'
import { Search, Filter, Clock, Calendar } from 'lucide-react'
import { Input } from '../ui/input'
import { Select } from '../ui/select'

interface AttendanceTableProps {
  records: AttendanceRecord[]
  isLoading?: boolean
  selectedMonth?: string
  onMonthChange?: (month: string) => void
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  isLoading,
  selectedMonth,
  onMonthChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredRecords = records.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesSearch =
      searchTerm === '' ||
      (r.date && r.date.includes(searchTerm)) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="ค้นหาวันที่, หมายเหตุ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'ทุกสถานะ', value: 'all' },
                { label: 'ตรงเวลา', value: 'on_time' },
                { label: 'มาสาย', value: 'late' },
                { label: 'ขาดงาน', value: 'absent' },
              ]}
            />
          </div>
        </div>

        {onMonthChange && (
          <div className="w-full sm:w-48">
            <Input
              type="month"
              value={selectedMonth || new Date().toISOString().slice(0, 7)}
              onChange={(e) => onMonthChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">วันที่</TableHead>
              <TableHead>เวลาเข้างาน</TableHead>
              <TableHead>เวลาออกงาน</TableHead>
              <TableHead>ชั่วโมงงาน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>หมายเหตุ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="h-14">
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="h-8 w-8 text-slate-300" />
                    <span>ไม่พบประวัติการลงเวลาตามเงื่อนไขที่เลือก</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-medium text-slate-900">
                    {record.date ? formatDate(record.date) : formatDate(record.clockInAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-mono text-slate-700">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{record.clockInAt ? formatTime(record.clockInAt) : '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-mono text-slate-700">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{record.clockOutAt ? formatTime(record.clockOutAt) : '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {record.workHours ? `${record.workHours} ชม.` : '-'}
                  </TableCell>
                  <TableCell>
                    <LateStatusBadge status={record.status} lateMinutes={record.lateMinutes} />
                  </TableCell>
                  <TableCell className="text-slate-500 max-w-xs truncate">
                    {record.notes || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
