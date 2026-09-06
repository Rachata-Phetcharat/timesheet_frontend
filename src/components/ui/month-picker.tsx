import React, { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface MonthPickerProps {
  value: string // YYYY-MM
  onChange: (value: string) => void
  label?: string
}

export const MonthPicker: React.FC<MonthPickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const [align, setAlign] = useState<'left' | 'right'>('left')
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Local state for the year currently being viewed
  const [viewYear, setViewYear] = useState(() => {
    return value ? parseInt(value.split('-')[0]) : new Date().getFullYear()
  })

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const spaceRight = window.innerWidth - rect.left
      
      if (spaceBelow < 350 && spaceAbove > spaceBelow) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
      
      if (spaceRight < 300) {
        setAlign('right')
      } else {
        setAlign('left')
      }
    }
    setIsOpen(!isOpen)
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

  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ]

  const handleMonthSelect = (monthIndex: number) => {
    const mm = (monthIndex + 1).toString().padStart(2, '0')
    onChange(`${viewYear}-${mm}`)
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (!value) return 'เลือกเดือน'
    try {
      const date = new Date(`${value}-01T00:00:00`)
      return format(date, 'MMMM yyyy', { locale: th })
    } catch {
      return value
    }
  }

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
        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2 text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white hover:bg-slate-50"
      >
        <span className="text-slate-900">{getDisplayText()}</span>
        <CalendarIcon className="h-4 w-4 text-slate-400" />
      </div>

      {isOpen && (
        <div 
          className={`absolute z-50 rounded-xl border border-slate-200 bg-white p-4 shadow-lg w-64 max-w-[100vw] ${
            position === 'top' ? 'bottom-[calc(100%+0.5rem)]' : 'top-[calc(100%+0.5rem)]'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <button 
              type="button"
              onClick={() => setViewYear(viewYear - 1)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div className="font-semibold text-slate-800 text-sm">ปี {viewYear}</div>
            <button 
              type="button"
              onClick={() => setViewYear(viewYear + 1)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((m, idx) => {
              const mm = (idx + 1).toString().padStart(2, '0')
              const isSelected = value === `${viewYear}-${mm}`
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMonthSelect(idx)}
                  className={`py-2 text-sm rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-200' 
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
