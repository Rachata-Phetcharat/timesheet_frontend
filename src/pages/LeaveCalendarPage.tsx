import React, { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  endOfDay
} from 'date-fns'
import { th } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { useAllLeaveRequests } from '../hooks/useLeaveRequests'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { LeaveRequest, LeaveType } from '../types/leave'

const leaveTypeColors: Record<LeaveType, string> = {
  sick: 'bg-rose-100 text-rose-700 border-rose-200',
  personal: 'bg-blue-100 text-blue-700 border-blue-200',
  vacation: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const leaveTypeLabels: Record<LeaveType, string> = {
  sick: 'ลาป่วย',
  personal: 'ลากิจ',
  vacation: 'ลาพักร้อน',
}

export const LeaveCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: allLeaves = [], isLoading } = useAllLeaveRequests()

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const activeLeaves = allLeaves.filter(
    (leave) => leave.status === 'approved' || leave.status === 'pending'
  )

  // Assign a fixed vertical "track" to each leave so they form perfectly straight continuous lines
  const leaveTracks = React.useMemo(() => {
    const tracks = new Map<string, number>()
    const sorted = [...activeLeaves].sort((a, b) => {
      const diff = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      if (diff !== 0) return diff
      return (a.employeeName || '').localeCompare(b.employeeName || '')
    })

    sorted.forEach((leave) => {
      const start = startOfDay(parseISO(leave.startDate)).getTime()
      const end = endOfDay(parseISO(leave.endDate)).getTime()
      let track = 0
      while (true) {
        let isFree = true
        for (const [otherId, otherTrack] of tracks.entries()) {
          if (otherTrack === track) {
            const other = activeLeaves.find((l) => l.id === otherId)
            if (other) {
              const otherStart = startOfDay(parseISO(other.startDate)).getTime()
              const otherEnd = endOfDay(parseISO(other.endDate)).getTime()
              if (start <= otherEnd && end >= otherStart) {
                isFree = false
                break
              }
            }
          }
        }
        if (isFree) {
          tracks.set(leave.id, track)
          break
        }
        track++
      }
    })
    return tracks
  }, [activeLeaves])

  const getLeavesForDay = (day: Date) => {
    const dayStart = day.getTime()
    return activeLeaves.filter((leave) => {
      const leaveStart = startOfDay(parseISO(leave.startDate)).getTime()
      const leaveEnd = endOfDay(parseISO(leave.endDate)).getTime()
      return dayStart >= leaveStart && dayStart <= leaveEnd
    })
  }

  const weeks: Date[][] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-indigo-600" />
            ปฏิทินการลา
          </h2>
          <p className="text-sm text-slate-500">
            ดูตารางการลาของทุกคนในบริษัท
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            วันนี้
          </Button>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-1 shadow-sm">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: th })}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-slate-200/80 bg-white w-full">
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-7 border-b border-slate-200">
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, i) => (
                  <div key={i} className="py-3 text-center text-sm font-semibold text-slate-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="flex flex-col border-l border-t border-slate-200">
                {weeks.map((week, weekIdx) => {
                  const weekStart = week[0].getTime()
                  const weekEnd = endOfDay(week[6]).getTime()
                  
                  // Leaves that overlap with this week
                  const weekLeaves = activeLeaves.filter((leave) => {
                    const ls = startOfDay(parseISO(leave.startDate)).getTime()
                    const le = endOfDay(parseISO(leave.endDate)).getTime()
                    return ls <= weekEnd && le >= weekStart
                  })
                  
                  const maxTrack = weekLeaves.reduce((max, leave) => Math.max(max, leaveTracks.get(leave.id) ?? 0), -1)
                  
                  // Height calculations
                  const trackHeight = 28 // height of a leave bar + gap
                  const topPadding = 46 // space for the date number at top of cell + extra gap
                  const bottomPadding = 8
                  const rowMinHeight = 120
                  const contentHeight = topPadding + (maxTrack + 1) * trackHeight + bottomPadding
                  const calculatedHeight = Math.max(rowMinHeight, contentHeight)
                  
                  return (
                    <div key={`week-${weekIdx}`} className="relative border-b border-slate-200 w-full" style={{ height: calculatedHeight }}>
                      {/* Background Day Cells */}
                      <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                        {week.map((day) => {
                          const isCurrentMonth = isSameMonth(day, monthStart)
                          return (
                            <div
                              key={`bg-${day.getTime()}`}
                              className={`border-r border-slate-200 p-1.5 sm:p-2 transition-colors ${
                                !isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'
                              } ${isToday(day) ? 'bg-indigo-50/30' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-sm font-medium ${
                                    !isCurrentMonth
                                      ? 'text-slate-400'
                                      : isToday(day)
                                      ? 'bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {format(day, 'd')}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Leaves Layer */}
                      <div className="absolute inset-0 pointer-events-none">
                        {weekLeaves.map((leave) => {
                          const ls = startOfDay(parseISO(leave.startDate)).getTime()
                          const leStart = startOfDay(parseISO(leave.endDate)).getTime() // use startOfDay for equality check with day
                          const leReal = endOfDay(parseISO(leave.endDate)).getTime()
                          
                          let startCol = 0
                          let endCol = 6
                          let isStartOfLeave = false
                          let isEndOfLeave = false
                          
                          week.forEach((day, idx) => {
                            const dt = day.getTime()
                            if (dt === ls) { startCol = idx; isStartOfLeave = true }
                            if (dt === leStart) { endCol = idx; isEndOfLeave = true }
                          })
                          
                          if (ls < weekStart) startCol = 0
                          if (leReal > weekEnd) endCol = 6
                          
                          const colSpan = endCol - startCol + 1
                          const track = leaveTracks.get(leave.id) ?? 0
                          
                          let visualColSpan = colSpan
                          let visualStartCol = startCol
                          
                          if (leave.duration === 'morning' && isEndOfLeave) {
                            visualColSpan -= 0.5
                          }
                          if (leave.duration === 'afternoon' && isStartOfLeave) {
                            visualColSpan -= 0.5
                            visualStartCol += 0.5
                          }
                          
                          const leftPercent = (visualStartCol / 7) * 100
                          const widthPercent = (visualColSpan / 7) * 100
                          
                          let shapeClasses = 'rounded-md border'
                          if (!isStartOfLeave && !isEndOfLeave) shapeClasses = 'border-y border-x-0 rounded-none'
                          else if (!isStartOfLeave && isEndOfLeave) shapeClasses = 'border-y border-r border-l-0 rounded-l-none rounded-r-md'
                          else if (isStartOfLeave && !isEndOfLeave) shapeClasses = 'border-y border-l border-r-0 rounded-r-none rounded-l-md'

                          const durationLabel = leave.duration === 'morning' ? ' (ครึ่งเช้า)' : leave.duration === 'afternoon' ? ' (ครึ่งบ่าย)' : ''

                          return (
                            <div 
                              key={`leave-${leave.id}-${weekIdx}`}
                              className="absolute px-1 pointer-events-auto"
                              style={{ 
                                top: topPadding + track * trackHeight, 
                                left: `${leftPercent}%`, 
                                width: `${widthPercent}%`,
                                height: 24
                              }}
                            >
                              <div
                                className={`group h-full w-full text-[10px] sm:text-xs relative flex items-center px-2 cursor-default ${shapeClasses} ${
                                  leaveTypeColors[leave.type]
                                }`}
                              >
                                {/* Tooltip - Now completely unbounded by grid cells */}
                                <div className="absolute z-[60] left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:flex flex-col items-center pointer-events-none">
                                  <div className="bg-slate-800 text-white font-medium text-[11px] sm:text-xs rounded-md py-1.5 px-2.5 whitespace-nowrap shadow-lg border border-slate-700">
                                    {leave.employeeName || 'ไม่ระบุ'} - {leaveTypeLabels[leave.type]}{durationLabel}
                                  </div>
                                  <div className="w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45 -mt-1.5"></div>
                                </div>

                                {/* Text naturally truncates to the FULL width of the multi-day bar */}
                                <div className="truncate w-full font-medium leading-none">
                                  {isStartOfLeave || startCol === 0 ? (
                                    <>
                                      <span className="font-semibold">{leave.employeeName || 'ไม่ระบุ'}</span>
                                      <span className="hidden sm:inline"> - {leaveTypeLabels[leave.type]}{durationLabel}</span>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex gap-4 text-xs sm:text-sm text-slate-600 px-4 pb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-100 border border-rose-200"></div>
                  <span>ลาป่วย</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
                  <span>ลากิจ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-200"></div>
                  <span>ลาพักร้อน</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
