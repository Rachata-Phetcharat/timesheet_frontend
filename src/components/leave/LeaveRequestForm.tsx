import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CreateLeaveRequestInput } from '../../types/leave'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { DateRangePicker } from '../ui/date-range-picker'
import { LEAVE_TYPE_OPTIONS } from './LeaveTypeSelect'
import { Send, CalendarDays, FileText, CheckCircle2 } from 'lucide-react'

const leaveSchema = z
  .object({
    type: z.enum(['personal', 'sick', 'vacation'], {
      message: 'กรุณาเลือกประเภทการลา',
    }),
    duration: z.enum(['full_day', 'morning', 'afternoon'], {
      message: 'กรุณาระบุช่วงเวลาที่ลา',
    }),
    startDate: z.string().min(1, 'กรุณาใส่วันที่เริ่มต้นลา'),
    endDate: z.string().min(1, 'กรุณาใส่วันที่สิ้นสุดการลา'),
    reason: z
      .string()
      .min(5, 'กรุณาระบุเหตุผลการลาอย่างน้อย 5 ตัวอักษร')
      .max(300, 'เหตุผลต้องไม่เกิน 300 ตัวอักษร'),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return new Date(data.startDate) <= new Date(data.endDate)
    },
    {
      message: 'วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้นลา',
      path: ['endDate'],
    }
  )

type LeaveFormValues = z.infer<typeof leaveSchema>

interface LeaveRequestFormProps {
  onSubmit: (data: CreateLeaveRequestInput) => Promise<void>
  isLoading?: boolean
  onSuccess?: () => void
  remainingQuotas?: {
    personal: number
    sick: number
    vacation: number
  }
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  onSubmit,
  isLoading,
  onSuccess,
  remainingQuotas = { personal: 6, sick: 30, vacation: 10 },
}) => {
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      type: 'personal',
      duration: 'full_day',
      startDate: '',
      endDate: '',
      reason: '',
    },
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const duration = watch('duration')
  const type = watch('type')

  React.useEffect(() => {
    if (type !== 'personal') {
      setValue('duration', 'full_day')
    }
  }, [type, setValue])

  // Calculate day count
  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    let diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    
    if (diffDays > 0 && type === 'personal' && (duration === 'morning' || duration === 'afternoon')) {
      diffDays -= 0.5
    }
    
    return diffDays > 0 ? diffDays : 0
  }

  const daysCount = calculateDays()

  const handleFormSubmit = async (values: LeaveFormValues) => {
    const requestedDays = calculateDays()
    
    // Check quota
    if (values.type === 'personal' && requestedDays > remainingQuotas.personal) {
      setError('type', { type: 'manual', message: `สิทธิลากิจของคุณเหลือเพียง ${remainingQuotas.personal} วัน` })
      return
    }
    if (values.type === 'sick' && requestedDays > remainingQuotas.sick) {
      setError('type', { type: 'manual', message: `สิทธิลาป่วยของคุณเหลือเพียง ${remainingQuotas.sick} วัน` })
      return
    }
    if (values.type === 'vacation' && requestedDays > remainingQuotas.vacation) {
      setError('type', { type: 'manual', message: `สิทธิลาพักร้อนของคุณเหลือเพียง ${remainingQuotas.vacation} วัน` })
      return
    }

    await onSubmit(values)
    setIsSubmitted(true)
    reset()
    if (onSuccess) onSuccess()
    setTimeout(() => setIsSubmitted(false), 5000)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {isSubmitted && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold">บันทึกการลาสำเร็จ!</p>
            <p className="text-xs text-emerald-700">ระบบได้ทำการอนุมัติการลาของคุณเรียบร้อยแล้ว</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="ประเภทการลา"
          options={LEAVE_TYPE_OPTIONS}
          error={errors.type?.message}
          {...register('type')}
        />
        <Select
          label="ช่วงเวลาที่ลา"
          options={[
            { label: 'ตลอดวัน', value: 'full_day' },
            { label: 'ครึ่งเช้า', value: 'morning' },
            { label: 'ครึ่งบ่าย', value: 'afternoon' },
          ]}
          error={errors.duration?.message}
          disabled={type !== 'personal'}
          {...register('duration')}
        />
      </div>

      <div className="w-full">
        <DateRangePicker
          label="ช่วงวันที่ลา (เริ่มต้น - สิ้นสุด)"
          startDate={startDate}
          endDate={endDate}
          onChange={(range) => {
            setValue('startDate', range.startDate, { shouldValidate: true })
            setValue('endDate', range.endDate, { shouldValidate: true })
          }}
          error={errors.startDate?.message || errors.endDate?.message}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700 select-none">
          เหตุผลประกอบการลา
        </label>
        <textarea
          rows={3}
          placeholder="โปรดระบุรายละเอียด เช่น ไปพบแพทย์, มีธุระส่วนตัวที่ต่างจังหวัด..."
          className="flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent transition-all duration-150"
          {...register('reason')}
        />
        {errors.reason?.message && (
          <p className="text-xs text-rose-500 font-medium">{errors.reason.message}</p>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
          isLoading={isLoading}
        >
          <Send className="h-4 w-4" />
          ยืนยันการบันทึกวันลา
        </Button>
      </div>
    </form>
  )
}
