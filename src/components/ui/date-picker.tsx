import React, { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  error?: string
  label?: string
  disabledPast?: boolean
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  error,
  label,
  disabledPast = false,
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
      
      if (spaceBelow < 400 && spaceAbove > spaceBelow) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
      
      if (spaceRight < 320) {
        setAlign('right')
      } else {
        setAlign('left')
      }
    }
    setIsOpen(!isOpen)
  }

  const selectedDate = value ? new Date(value) : undefined

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]
      onChange(dateString)
      setIsOpen(false)
    }
  }

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
  const displayText = value ? format(new Date(value), displayFormat, { locale: th }) : 'เลือกวันที่'

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
        className={`group flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2 text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white hover:bg-slate-50 ${
          error ? 'border-rose-500 ring-rose-500' : 'border-slate-200'
        }`}
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>
          {displayText}
        </span>
        <div className="flex items-center gap-2 text-slate-400">
          {value && (
            <div 
              className="hidden group-hover:flex p-1 -mr-1 hover:bg-slate-200 hover:text-slate-700 rounded-md transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
                setIsOpen(false)
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </div>
          )}
          <CalendarIcon className="h-4 w-4" />
        </div>
      </div>
      
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {isOpen && (
        <div 
          className={`absolute z-50 rounded-xl border border-slate-200 bg-white p-3 shadow-lg w-max max-w-[100vw] sm:max-w-none overflow-x-auto ${
            position === 'top' ? 'bottom-[calc(100%+0.5rem)]' : 'top-[calc(100%+0.5rem)]'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            numberOfMonths={1}
            disabled={disabledPast ? { before: new Date(new Date().setHours(0,0,0,0)) } : undefined}
          />
        </div>
      )}
    </div>
  )
}
