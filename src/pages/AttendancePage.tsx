import React, { useState } from 'react'
import { useAttendanceRecords, useAttendanceSummary } from '../hooks/useAttendance'
import { ClockInOutCard } from '../components/attendance/ClockInOutCard'
import { AttendanceTable } from '../components/attendance/AttendanceTable'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Download, Calendar, History, Clock } from 'lucide-react'

export const AttendancePage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )

  const { data: records = [], isLoading: isRecordsLoading } = useAttendanceRecords(selectedMonth)
  const { data: summary } = useAttendanceSummary(selectedMonth)

  // Export records to CSV
  const handleExportCsv = () => {
    if (records.length === 0) return
    const headers = ['วันที่,เวลาเข้างาน,เวลาออกงาน,ชั่วโมงทำงาน,สถานะ,นาทีที่สาย,หมายเหตุ']
    const rows = records.map((r) => {
      const date = r.date || ''
      const clockIn = r.clockInAt ? new Date(r.clockInAt).toLocaleTimeString('th-TH') : ''
      const clockOut = r.clockOutAt ? new Date(r.clockOutAt).toLocaleTimeString('th-TH') : ''
      const hours = r.workHours || 0
      const status = r.status === 'on_time' ? 'ตรงเวลา' : r.status === 'late' ? 'สาย' : 'ขาดงาน'
      const lateMin = r.lateMinutes || 0
      const notes = `"${(r.notes || '').replace(/"/g, '""')}"`
      return `${date},${clockIn},${clockOut},${hours},${status},${lateMin},${notes}`
    })

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `timesheet_attendance_${selectedMonth}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Clock className="h-6 w-6 text-indigo-600" />
            ลงเวลาทำงาน & ประวัติการเข้างาน
          </h2>
          <p className="text-sm text-slate-500">
            บันทึกเวลาเข้า-ออกงานประจำวัน และตรวจสอบประวัติการลงเวลาย้อนหลัง
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          disabled={records.length === 0}
          className="gap-2 text-slate-700 hover:border-indigo-300"
        >
          <Download className="h-4 w-4 text-indigo-600" />
          ส่งออกข้อมูล (Export CSV)
        </Button>
      </div>

      {/* Clock in Card */}
      <ClockInOutCard />

      {/* Attendance History Section */}
      <Card className="border-slate-200/80 bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-600" />
                ตารางประวัติการลงเวลา
              </CardTitle>
              <CardDescription>
                แสดงรายการบันทึกเวลาในเดือน {selectedMonth}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AttendanceTable
            records={records}
            isLoading={isRecordsLoading}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </CardContent>
      </Card>
    </div>
  )
}
