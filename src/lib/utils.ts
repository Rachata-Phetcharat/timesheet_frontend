import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return '--:--'
  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } catch {
    return '--:--'
  }
}

export function formatDuration(clockIn: string | null, clockOut: string | null): string {
  if (!clockIn || !clockOut) return '-'
  try {
    const start = new Date(clockIn).getTime()
    const end = new Date(clockOut).getTime()
    const diffMs = end - start
    if (diffMs <= 0) return '-'
    const totalMinutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours} ชม. ${minutes} นาที`
  } catch {
    return '-'
  }
}
