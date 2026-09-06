import React, { useState } from 'react'
import { useTeamAttendance } from '../hooks/useAttendance'
import { LateStatusBadge } from '../components/attendance/LateStatusBadge'
import { Pagination } from '../components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { MonthPicker } from '../components/ui/month-picker'
import { formatDate, formatTime } from '../lib/utils'
import { Users, Search } from 'lucide-react'

export const TeamAttendancePage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedDepartment] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: teamRecords = [], isLoading: isTeamLoading } = useTeamAttendance(
    selectedMonth,
    selectedDepartment
  )

  // Filter team attendance by search term
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
  }, [searchTerm, selectedMonth, selectedDepartment])
  const paginatedRecords = filteredTeamRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            ประวัติการเข้างานของทีม
          </h2>
          <p className="text-sm text-slate-500">
            ดูเวลาเข้า-ออกงานของพนักงานคนอื่นในบริษัทเพื่อความโปร่งใส
          </p>
        </div>
      </div>

      <Card className="border-slate-200/80 bg-white w-full">
        <CardHeader className="pb-0">
          <div>
            <CardTitle className="text-lg">ข้อมูลการลงเวลา</CardTitle>
            <CardDescription>
              ตารางแสดงข้อมูลการลงเวลาของเพื่อนร่วมงาน
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
            <div className="w-full sm:w-56">
              <MonthPicker
                value={selectedMonth}
                onChange={(val) => setSelectedMonth(val)}
              />
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
                ) : paginatedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                      ไม่พบข้อมูลการลงเวลาของทีม
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((rec) => (
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
