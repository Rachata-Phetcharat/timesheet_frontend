import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Modal } from '../ui/modal'
import { Input } from '../ui/input'
import { LateStatusBadge } from './LateStatusBadge'
import { useClockIn, useClockOut, useAttendanceSummary } from '../../hooks/useAttendance'
import { formatTime } from '../../lib/utils'
import { Clock, LogIn, LogOut, CheckCircle, AlertTriangle, Calendar } from 'lucide-react'

export const ClockInOutCard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [notes, setNotes] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'in' | 'out'>('in')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const { data: summary, isLoading: isSummaryLoading } = useAttendanceSummary()
  const clockInMutation = useClockIn()
  const clockOutMutation = useClockOut()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleOpenAction = (type: 'in' | 'out') => {
    setActionType(type)
    setNotes('')
    setIsModalOpen(true)
  }

  const handleConfirmAction = async () => {
    try {
      if (actionType === 'in') {
        await clockInMutation.mutateAsync({ notes })
        setSuccessMessage('ลงเวลาเข้างานสำเร็จเรียบร้อย')
      } else {
        await clockOutMutation.mutateAsync({ notes })
        setSuccessMessage('ลงเวลาออกงานสำเร็จเรียบร้อย')
      }
      setIsModalOpen(false)
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: any) {
      console.error('Clock action failed:', err)
      const msg = err.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกเวลา'
      setErrorMessage(msg)
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const isClockedIn = summary?.currentStatus === 'clocked_in'
  const isClockedOut = summary?.currentStatus === 'clocked_out'
  const todayRecord = summary?.todayRecord

  const formattedDate = currentTime.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const formattedDigitalTime = currentTime.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <>
      <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-white via-white to-indigo-50/30">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-100/40 blur-2xl" />
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                ระบบลงเวลาทำงาน (Clock-in / Clock-out)
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-1">
                <Calendar className="h-4 w-4 text-slate-400" />
                {formattedDate}
              </CardDescription>
            </div>
            {todayRecord && (
              <div>
                <LateStatusBadge status={todayRecord.status} lateMinutes={todayRecord.lateMinutes} />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Digital Clock Box */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-900 px-6 py-6 text-white shadow-inner">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
              เวลาปัจจุบัน (GMT+7)
            </span>
            <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-wider text-indigo-300">
              {formattedDigitalTime}
            </span>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>กะทำงานปกติ 09:00 - 18:00 น.</span>
            </div>
          </div>

          {/* Alert Error */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-800 animate-fade-in">
              <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Alert Success */}
          {successMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-800 animate-fade-in">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Today's Status Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">เวลาเข้างานวันนี้</span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">
                  <LogIn className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-2 font-mono text-xl font-bold text-slate-800">
                {todayRecord?.clockInAt ? formatTime(todayRecord.clockInAt) : '--:--'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {todayRecord?.clockInAt ? 'บันทึกเวลาเข้าแล้ว' : 'ยังไม่ลงเวลาเข้า'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">เวลาออกงานวันนี้</span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs">
                  <LogOut className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-2 font-mono text-xl font-bold text-slate-800">
                {todayRecord?.clockOutAt ? formatTime(todayRecord.clockOutAt) : '--:--'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {todayRecord?.clockOutAt ? 'บันทึกเวลาออกแล้ว' : 'ยังไม่ลงเวลาออก'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="default"
              size="lg"
              className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
              disabled={isClockedIn || isClockedOut || isSummaryLoading}
              onClick={() => handleOpenAction('in')}
              isLoading={clockInMutation.isPending}
            >
              <LogIn className="h-5 w-5" />
              {isClockedIn || isClockedOut ? 'ลงเวลาเข้างานแล้ว' : 'ลงเวลาเข้างาน (Clock In)'}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              className="flex-1 gap-2 bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200"
              disabled={!isClockedIn || isClockedOut || isSummaryLoading}
              onClick={() => handleOpenAction('out')}
              isLoading={clockOutMutation.isPending}
            >
              <LogOut className="h-5 w-5" />
              {isClockedOut ? 'ลงเวลาออกงานแล้ว' : 'ลงเวลาออกงาน (Clock Out)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation & Notes Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={actionType === 'in' ? 'ยืนยันการลงเวลาเข้างาน' : 'ยืนยันการลงเวลาออกงาน'}
        description={
          actionType === 'in'
            ? 'เวลาที่ระบบจะบันทึก: ' + formattedDigitalTime
            : 'เวลาที่ระบบจะบันทึก: ' + formattedDigitalTime
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-3.5 text-sm text-slate-600 flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>
              โปรดตรวจสอบเวลาปัจจุบัน ({formattedDigitalTime}) ให้ถูกต้องก่อนกดยืนยันบันทึกเวลา
            </p>
          </div>

          <Input
            label="หมายเหตุเพิ่มเติม (ถ้ามี)"
            placeholder="เช่น ทำงานจากบ้าน, ติดต่อลูกค้าภายนอก, ปัญหาการเดินทาง..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              variant={actionType === 'in' ? 'default' : 'destructive'}
              onClick={handleConfirmAction}
              isLoading={clockInMutation.isPending || clockOutMutation.isPending}
            >
              ยืนยันบันทึกเวลา
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
