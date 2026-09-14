import React, { useState } from 'react'
import { useTeamAttendance } from '../hooks/useAttendance'
import { useAllLeaveRequests, useUpdateLeaveStatus } from '../hooks/useLeaveRequests'
import { LeaveRequestTable } from '../components/leave/LeaveRequestTable'
import { LateStatusBadge } from '../components/attendance/LateStatusBadge'
import { Pagination } from '../components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { MonthPicker } from '../components/ui/month-picker'
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
      (r.employeeEmail && r.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.employeeId && r.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      
    return matchesSearch
  })
  const totalPages = Math.ceil(filteredTeamRecords.length / itemsPerPage)
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedMonth])
  const paginatedTeamRecords = filteredTeamRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Export Team Attendance to CSV
  const handleExportTeamCsv = () => {
    if (paginatedTeamRecords.length === 0) return
    const headers = ['รหัสพนักงาน,ชื่อพนักงาน,อีเมล,วันที่,เวลาเข้างาน,เวลาออกงาน,ชั่วโมงงาน,สถานะ,นาทีสาย,หมายเหตุ']
    const rows = paginatedTeamRecords.map((r) => {
      const empId = r.employeeId || ''
      const empName = `"${r.employeeName || ''}"`
      const empEmail = r.employeeEmail || ''
      const date = r.date || ''
      const clockIn = r.clockInAt ? new Date(r.clockInAt).toLocaleTimeString('th-TH') : ''
      const clockOut = r.clockOutAt ? new Date(r.clockOutAt).toLocaleTimeString('th-TH') : ''
      const hours = r.workHours || 0
      const status = r.status === 'on_time' ? 'ตรงเวลา' : r.status === 'late' ? 'สาย' : 'ขาดงาน'
      const lateMin = r.lateMinutes || 0
      const notes = `"${(r.notes || '').replace(/"/g, '""')}"`
      return `${empId},${empName},${empEmail},${date},${clockIn},${clockOut},${hours},${status},${lateMin},${notes}`
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
          disabled={paginatedTeamRecords.length === 0}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <Download className="h-4 w-4" />
          ส่งออกรายงานทีม
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">พนักงานทั้งหมด</span>
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{filteredTeamRecords.length}</p>
          <p className="text-xs text-slate-400 mt-1">รายการบันทึกเวลา</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">มาตรงเวลา</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {filteredTeamRecords.filter((r) => r.status === 'on_time').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">พนักงาน</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">มาสาย</span>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">
            {filteredTeamRecords.filter((r) => r.status === 'late').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">พนักงาน</p>
        </Card>

      </div>

      {/* Leave Approvals Section */}
      <Card className="border-slate-200/80 bg-white w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-indigo-500" />
                ประวัติคำขอลางานของพนักงาน
              </CardTitle>
              <CardDescription>
                ดูประวัติการขอลางานทั้งหมดของพนักงาน
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
      <Card className="border-slate-200/80 bg-white w-full">
        <CardHeader className="pb-0">
          <div>
            <CardTitle className="text-lg">ประวัติการเข้างานของทีม</CardTitle>
            <CardDescription>
              ตารางแสดงข้อมูลการลงเวลาของพนักงานทุกคนในสังกัด
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="ค้นหาชื่อ, อีเมล, รหัสพนักงาน, หมายเหตุ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2.5 sm:w-auto w-full">
              <div className="w-full sm:w-44">
                <MonthPicker
                  value={selectedMonth}
                  onChange={(val) => setSelectedMonth(val)}
                />
              </div>

              <div className="w-full sm:w-44">
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  options={[
                    { label: 'ทุกแผนก', value: 'all' },
                    { label: 'Engineering', value: 'Engineering' },
                    { label: 'Human Resources', value: 'HR' },
                    { label: 'Marketing', value: 'Marketing' },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="whitespace-nowrap">
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
                ) : paginatedTeamRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                      ไม่พบข้อมูลการลงเวลาของทีม
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTeamRecords.map((rec) => (
                    <TableRow key={rec.id} className="hover:bg-slate-50/80 whitespace-nowrap">
                      <TableCell className="font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {rec.employeeName ? rec.employeeName.charAt(0) : 'E'}
                          </div>
                          <div>
                            <p className="leading-none">{rec.employeeName || 'ไม่ระบุชื่อ'}</p>
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
                      <TableCell className="text-slate-500 max-w-[200px] truncate whitespace-normal">
                        {rec.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </CardContent>
      </Card>
    </div>
  )
}
