import React, { useState } from 'react'
import { useTeamAttendance } from '../hooks/useAttendance'
import { useAllLeaveRequests, useUpdateLeaveStatus } from '../hooks/useLeaveRequests'
import { LeaveRequestTable } from '../components/leave/LeaveRequestTable'
import { LateStatusBadge } from '../components/attendance/LateStatusBadge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { formatDate, formatTime } from '../lib/utils'
import {
  FileBarChart,
  Download,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react'

export const AdminReportPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: teamRecords = [], isLoading: isTeamLoading } = useTeamAttendance(
    selectedMonth,
    selectedDepartment
  )
  const { data: allLeaves = [], isLoading: isLeavesLoading } = useAllLeaveRequests()
  const updateLeaveMutation = useUpdateLeaveStatus()

  const handleUpdateStatus = async (id: string, status: any, comment?: string) => {
    await updateLeaveMutation.mutateAsync({ id, status, comment })
  }

  // Filter team attendance
  const filteredTeamRecords = teamRecords.filter((r) => {
    const matchesSearch =
      searchTerm === '' ||
      (r.employeeName && r.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.employeeId && r.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  // Export Team Attendance to CSV
  const handleExportTeamCsv = () => {
    if (filteredTeamRecords.length === 0) return
    const headers = ['รหัสพนักงาน,ชื่อพนักงาน,วันที่,เวลาเข้างาน,เวลาออกงาน,ชั่วโมงงาน,สถานะ,นาทีสาย,หมายเหตุ']
    const rows = filteredTeamRecords.map((r) => {
      const empId = r.employeeId || ''
      const empName = `"${r.employeeName || ''}"`
      const date = r.date || ''
      const clockIn = r.clockInAt ? new Date(r.clockInAt).toLocaleTimeString('th-TH') : ''
      const clockOut = r.clockOutAt ? new Date(r.clockOutAt).toLocaleTimeString('th-TH') : ''
      const hours = r.workHours || 0
      const status = r.status === 'on_time' ? 'ตรงเวลา' : r.status === 'late' ? 'สาย' : 'ขาดงาน'
      const lateMin = r.lateMinutes || 0
      const notes = `"${(r.notes || '').replace(/"/g, '""')}"`
      return `${empId},${empName},${date},${clockIn},${clockOut},${hours},${status},${lateMin},${notes}`
    })

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `team_attendance_report_${selectedMonth}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const pendingLeaves = allLeaves.filter((l) => l.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-indigo-600" />
            รายงานสรุปการเข้างานทีม & ระบบพิจารณาการลา
          </h2>
          <p className="text-sm text-slate-500">
            ภาพรวมการลงเวลาทำงานของพนักงานทุกคนในองค์กร และรายการรออนุมัติใบลา
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={handleExportTeamCsv}
          disabled={filteredTeamRecords.length === 0}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <Download className="h-4 w-4" />
          ส่งออกรายงานทีม (Export CSV)
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">พนักงานทั้งหมด</span>
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{teamRecords.length}</p>
          <p className="text-xs text-slate-400 mt-1">รายการบันทึกเวลา</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">มาตรงเวลา</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {teamRecords.filter((r) => r.status === 'on_time').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">พนักงาน</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">มาสาย</span>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">
            {teamRecords.filter((r) => r.status === 'late').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">พนักงาน</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">รออนุมัติใบลา</span>
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-600">{pendingLeaves.length}</p>
          <p className="text-xs text-slate-400 mt-1">รายการรอพิจารณา</p>
        </Card>
      </div>

      {/* Leave Approvals Section */}
      <Card className="border-slate-200/80 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                คำขอลางานของพนักงาน (พิจารณาอนุมัติ / ปฏิเสธ)
              </CardTitle>
              <CardDescription>
                คลิกปุ่ม "พิจารณา" เพื่ออนุมัติหรือปฏิเสธคำขอลาพร้อมใส่ข้อความหมายเหตุ
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LeaveRequestTable
            requests={allLeaves}
            isLoading={isLeavesLoading}
            isAdmin={true}
            onUpdateStatus={handleUpdateStatus}
          />
        </CardContent>
      </Card>

      {/* Team Attendance Table */}
      <Card className="border-slate-200/80 bg-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">ประวัติการเข้างานของทีม</CardTitle>
              <CardDescription>ตารางแสดงข้อมูลการลงเวลาของพนักงานทุกคนในสังกัด</CardDescription>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <div className="w-40">
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>

              <div className="w-44">
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  options={[
                    { label: 'ทุกแผนก (All)', value: 'all' },
                    { label: 'Engineering', value: 'Engineering' },
                    { label: 'Human Resources', value: 'HR' },
                    { label: 'Marketing', value: 'Marketing' },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="ค้นหาชื่อพนักงาน, รหัสพนักงาน, หมายเหตุ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-2xl border border-slate-200/80 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>พนักงาน</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead>เวลาเข้างาน</TableHead>
                  <TableHead>เวลาออกงาน</TableHead>
                  <TableHead>ชั่วโมงงาน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>หมายเหตุ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTeamLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="h-14">
                        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredTeamRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                      ไม่พบข้อมูลการลงเวลาของทีม
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeamRecords.map((rec) => (
                    <TableRow key={rec.id} className="hover:bg-slate-50/80">
                      <TableCell className="font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {rec.employeeName ? rec.employeeName.charAt(0) : 'E'}
                          </div>
                          <div>
                            <p className="leading-none">{rec.employeeName || 'ไม่ระบุชื่อ'}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{rec.employeeId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {rec.date ? formatDate(rec.date) : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-slate-700">
                        {rec.clockInAt ? formatTime(rec.clockInAt) : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-slate-700">
                        {rec.clockOutAt ? formatTime(rec.clockOutAt) : '-'}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {rec.workHours ? `${rec.workHours} ชม.` : '-'}
                      </TableCell>
                      <TableCell>
                        <LateStatusBadge status={rec.status} lateMinutes={rec.lateMinutes} />
                      </TableCell>
                      <TableCell className="text-slate-500 max-w-xs truncate">
                        {rec.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
