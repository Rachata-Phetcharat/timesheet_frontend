import * as React from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]'

    const variants = {
      default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 focus-visible:ring-indigo-500',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200 focus-visible:ring-rose-500',
      outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 focus-visible:ring-slate-400',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400',
      ghost: 'hover:bg-slate-100 hover:text-slate-900 text-slate-600 focus-visible:ring-slate-400',
      link: 'text-indigo-600 underline-offset-4 hover:underline focus-visible:ring-indigo-500 p-0 h-auto',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 focus-visible:ring-emerald-500',
      warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-200 focus-visible:ring-amber-500',
    }

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-lg px-3 text-xs',
      lg: 'h-12 rounded-xl px-6 text-base font-semibold',
      icon: 'h-10 w-10 p-0',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
