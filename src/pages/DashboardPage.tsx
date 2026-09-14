import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAttendanceRecords, useAttendanceSummary } from '../hooks/useAttendance'
import { useMyLeaveRequests } from '../hooks/useLeaveRequests'
import { ClockInOutCard } from '../components/attendance/ClockInOutCard'
import { AttendanceTable } from '../components/attendance/AttendanceTable'
import { LeaveStatusBadge } from '../components/leave/LeaveStatusBadge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { formatDate } from '../lib/utils'
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Sparkles,
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const currentMonthStr = new Date().toISOString().slice(0, 7)

  const { data: summary, isLoading: isSummaryLoading } = useAttendanceSummary(currentMonthStr)
  const { data: records = [], isLoading: isRecordsLoading } = useAttendanceRecords(currentMonthStr)
  const { data: leaves = [], isLoading: isLeavesLoading } = useMyLeaveRequests()

  const currentMonthThai = new Date().toLocaleDateString('th-TH', {
    month: 'long',
    year: 'numeric',
  })

  // Quick stats calculations from backend API summary
  const totalDays = summary?.totalDays || 0
  const onTimeCount = summary?.onTimeCount || 0
  const lateCount = summary?.lateCount || 0
  const absentCount = summary?.absentCount || 0
  const totalLateMinutes = summary?.totalLateMinutes || 0
  const totalHours = summary?.totalWorkHours || 0

  const onTimePercentage = totalDays > 0 ? Math.round((onTimeCount / totalDays) * 100) : 100

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              สวัสดี, คุณ{user?.name || 'พนักงาน'}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link to="/attendance">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-sm"
              >
                <Clock className="mr-1.5 h-4 w-4 text-indigo-600" />
                บันทึกเวลาทำงาน
              </Button>
            </Link>
            <Link to="/leave-requests">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-sm"
              >
                <FileText className="mr-1.5 h-4 w-4 text-indigo-600" />
                ยื่นคำขอลางาน
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* On Time Rate */}
        <Card className="p-5 border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ตรงเวลา (On-Time)</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{onTimeCount}</span>
              <span className="text-xs text-slate-500 font-medium">/ {totalDays} วัน</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>ความตรงเวลา {onTimePercentage}%</span>
            </div>
          </div>
        </Card>

        {/* Late Count */}
        <Card className="p-5 border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">มาสาย (Late)</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-600">{lateCount}</span>
              <span className="text-xs text-slate-500 font-medium">ครั้ง</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              รวมสายสะสม: <strong className="text-slate-800">{totalLateMinutes}</strong> นาที
            </p>
          </div>
        </Card>

        {/* Absent & Leaves */}
        <Card className="p-5 border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">การลา / ขาดงาน</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-600">{absentCount}</span>
              <span className="text-xs text-slate-500 font-medium">วันขาด</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              คำขอลาเดือนนี้: <strong className="text-slate-800">{leaves.length}</strong> รายการ
            </p>
          </div>
        </Card>

        {/* Total Working Hours */}
        <Card className="p-5 border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ชั่วโมงทำงานสะสม</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600">{totalHours}</span>
              <span className="text-xs text-slate-500 font-medium">ชม.</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              เฉลี่ย ~{(totalHours / (totalDays || 1)).toFixed(1)} ชม./วัน
            </p>
          </div>
        </Card>
      </div>

      {/* Main Row: Clock in Card + Pending Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClockInOutCard readOnly={true} />
        </div>

        {/* Leave Requests Quick Card */}
        <div className="space-y-4">
          <Card className="h-full border-slate-200/80 bg-white flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  ประวัติการลางานล่าสุด
                </CardTitle>
                <Link to="/leave-requests" className="text-xs font-semibold text-indigo-600 hover:underline">
                  ดูทั้งหมด
                </Link>
              </div>
              <CardDescription>รายการบันทึกวันลาล่าสุดของคุณ</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 flex-1">
              {isLeavesLoading ? (
                <div className="space-y-2">
                  <div className="h-12 bg-slate-100 animate-pulse rounded-xl" />
                  <div className="h-12 bg-slate-100 animate-pulse rounded-xl" />
                </div>
              ) : leaves.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  ยังไม่มีประวัติการยื่นลางานในขณะนี้
                </div>
              ) : (
                leaves.slice(0, 3).map((lv) => (
                  <div
                    key={lv.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-800">
                          {lv.type === 'personal' ? 'ลากิจ' : lv.type === 'sick' ? 'ลาป่วย' : 'ลาพักร้อน'}
                        </span>
                        <LeaveStatusBadge status={lv.status} />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(lv.startDate)} - {formatDate(lv.endDate)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            <div className="p-4 pt-0 border-t border-slate-100">
              <Link to="/leave-requests">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs text-slate-700">
                  <span>บันทึกวันลาใหม่</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Attendance Records */}
      <Card className="border-slate-200/80 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">ประวัติการลงเวลาทำงานย้อนหลัง</CardTitle>
              <CardDescription>แสดงรายการบันทึกเวลาของเดือนปัจจุบัน</CardDescription>
            </div>
            <Link to="/attendance">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-600 gap-1">
                <span>ดูประวัติทั้งหมด</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <AttendanceTable records={records.slice(0, 5)} isLoading={isRecordsLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
