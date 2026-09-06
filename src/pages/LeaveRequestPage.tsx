import React from 'react'
import { useMyLeaveRequests, useCreateLeaveRequest, useCancelLeaveRequest } from '../hooks/useLeaveRequests'
import { LeaveRequestForm } from '../components/leave/LeaveRequestForm'
import { LeaveRequestTable } from '../components/leave/LeaveRequestTable'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { CalendarDays, HeartPulse, UserCheck, ShieldAlert, FileText } from 'lucide-react'

export const LeaveRequestPage: React.FC = () => {
  const { data: requests = [], isLoading: isRequestsLoading } = useMyLeaveRequests()
  const createMutation = useCreateLeaveRequest()
  const cancelMutation = useCancelLeaveRequest()

  const handleCreateLeave = async (values: any) => {
    await createMutation.mutateAsync(values)
  }

  const handleCancelLeave = async (id: string) => {
    await cancelMutation.mutateAsync(id)
  }

  // Calculate exact days taken for a request
  const getLeaveDays = (r: any) => {
    if (!r.startDate || !r.endDate) return 0
    const start = new Date(r.startDate).getTime()
    const end = new Date(r.endDate).getTime()
    let diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    if (diffDays > 0 && r.type === 'personal' && (r.duration === 'morning' || r.duration === 'afternoon')) {
      diffDays -= 0.5
    }
    return diffDays > 0 ? diffDays : 0
  }

  // Quota mock calculations
  const personalLeavesTaken = requests
    .filter((r) => r.type === 'personal' && r.status === 'approved')
    .reduce((acc, r) => acc + getLeaveDays(r), 0)
  const sickLeavesTaken = requests
    .filter((r) => r.type === 'sick' && r.status === 'approved')
    .reduce((acc, r) => acc + getLeaveDays(r), 0)
  const vacationLeavesTaken = requests
    .filter((r) => r.type === 'vacation' && r.status === 'approved')
    .reduce((acc, r) => acc + getLeaveDays(r), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-indigo-600" />
          ระบบยื่นคำขอลางาน & ประวัติการลา
        </h2>
        <p className="text-sm text-slate-500">
          ยื่นคำขอลากิจ ลาป่วย ลาพักร้อน พร้อมติดตามสถานะการอนุมัติแบบเรียลไทม์
        </p>
      </div>

      {/* Quota cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-900">สิทธิลากิจ (Personal)</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-700">{6 - personalLeavesTaken} / 6</span>
            <span className="text-xs text-slate-500">ใช้ไป {personalLeavesTaken} วัน</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-sky-50/50 to-white border-sky-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-900">สิทธิลาป่วย (Sick)</span>
            <div className="h-8 w-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-700">{30 - sickLeavesTaken} / 30</span>
            <span className="text-xs text-slate-500">ใช้ไป {sickLeavesTaken} วัน</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">ลาพักร้อน (Vacation)</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700">{10 - vacationLeavesTaken} / 10</span>
            <span className="text-xs text-slate-500">ใช้ไป {vacationLeavesTaken} วัน</span>
          </div>
        </Card>
      </div>

      {/* Main Form & Table Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="xl:col-span-4">
          <Card className="border-slate-200/80 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                แบบฟอร์มยื่นคำขอลางาน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaveRequestForm
                onSubmit={handleCreateLeave}
                isLoading={createMutation.isPending}
                remainingQuotas={{
                  personal: 6 - personalLeavesTaken,
                  sick: 30 - sickLeavesTaken,
                  vacation: 10 - vacationLeavesTaken
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Table Column */}
        <div className="xl:col-span-8">
          <Card className="border-slate-200/80 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">ประวัติและสถานะคำขอลางาน</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaveRequestTable
                requests={requests}
                isLoading={isRequestsLoading}
                isAdmin={false}
                onCancel={handleCancelLeave}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
