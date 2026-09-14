import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { LogOut, UserCircle2, Menu } from 'lucide-react'

interface NavbarProps {
  onToggleSidebar?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-300">
            <span className="font-extrabold text-base">TS</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
              ระบบบันทึกเวลาการทำงาน (Timesheet)
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">

        {/* User profile dropdown info */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
          <div className="flex items-center gap-2">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-100"
              />
            ) : (
              <UserCircle2 className="h-8 w-8 text-slate-400" />
            )}
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900">{user?.name || 'พนักงาน'}</span>
              <div className="flex items-center gap-1">
                <Badge variant={user?.role === 'admin' ? 'purple' : 'secondary'} className="text-[10px] py-0 px-1.5">
                  {user?.role === 'admin' ? 'HR Admin' : 'Employee'}
                </Badge>
                <span className="text-[10px] text-slate-400">{user?.department}</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
            title="ออกจากระบบ"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1 text-xs">ออกจากระบบ</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
