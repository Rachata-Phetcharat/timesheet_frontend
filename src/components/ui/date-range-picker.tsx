import React, { useState, useRef, useEffect } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfDay } from 'date-fns'
import { th } from 'date-fns/locale'

interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onChange: (range: { startDate: string; endDate: string }) => void
  error?: string
  label?: string
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  error,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const [align, setAlign] = useState<'left' | 'right'>('left')
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const spaceRight = window.innerWidth - rect.left
      
      // If there is less than 450px below and more space above, open upwards
      if (spaceBelow < 450 && spaceAbove > spaceBelow) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
      
      // Since it's a 2-month picker, it needs roughly 550-600px width
      if (spaceRight < 560) {
        setAlign('right')
      } else {
        setAlign('left')
      }
    }
    setIsOpen(!isOpen)
  }

  const selectedRange: DateRange | undefined =
    startDate && endDate
      ? { from: new Date(startDate), to: new Date(endDate) }
      : undefined

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      // Offset timezone to avoid UTC conversion issues
      const from = new Date(range.from.getTime() - range.from.getTimezoneOffset() * 60000)
      const to = new Date(range.to.getTime() - range.to.getTimezoneOffset() * 60000)
      onChange({
        startDate: from.toISOString().split('T')[0],
        endDate: to.toISOString().split('T')[0],
      })
      if (range.from.getTime() !== range.to.getTime()) {
        setIsOpen(false)
      }
    } else if (range?.from) {
      const from = new Date(range.from.getTime() - range.from.getTimezoneOffset() * 60000)
      onChange({
        startDate: from.toISOString().split('T')[0],
        endDate: from.toISOString().split('T')[0],
      })
    }
  }

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayFormat = 'd MMM yyyy'
  const displayText =
    startDate && endDate
      ? startDate === endDate
        ? format(new Date(startDate), displayFormat, { locale: th })
        : `${format(new Date(startDate), displayFormat, { locale: th })} - ${format(
            new Date(endDate),
            displayFormat,
            { locale: th }
          )}`
      : 'เลือกช่วงวันที่'

  return (
    <div className="relative w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label 
          className="block text-sm font-medium text-slate-700 select-none cursor-pointer"
          onClick={toggleOpen}
        >
          {label}
        </label>
      )}
      
      <div 
        onClick={toggleOpen}
        className={`flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2 text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white hover:bg-slate-50 ${
          error ? 'border-rose-500 ring-rose-500' : 'border-slate-200'
        }`}
      >
        <span className={startDate ? 'text-slate-900' : 'text-slate-400'}>
          {displayText}
        </span>
        <CalendarIcon className="h-4 w-4 text-slate-400" />
      </div>
      
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {isOpen && (
        <div 
          className={`absolute z-50 rounded-xl border border-slate-200 bg-white p-3 shadow-lg w-max max-w-[100vw] sm:max-w-none overflow-x-auto ${
            position === 'top' ? 'bottom-[calc(100%+0.5rem)]' : 'top-[calc(100%+0.5rem)]'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={{ before: startOfDay(new Date()) }}
            showOutsideDays
            fixedWeeks
          />
        </div>
      )}
    </div>
  )
}
