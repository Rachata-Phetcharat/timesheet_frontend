import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  FileBarChart,
  Users,
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const navItems = [
    {
      to: '/',
      label: 'แดชบอร์ดสรุป',
      icon: LayoutDashboard,
    },
    {
      to: '/attendance',
      label: 'ลงเวลาทำงาน',
      icon: Clock,
    },
    {
      to: '/leave-requests',
      label: 'คำขอลางาน',
      icon: CalendarDays,
    },
    {
      to: '/team-attendance',
      label: 'ตารางเข้างานของทีม',
      icon: Users,
    },
  ]

  const adminItems = [
    {
      to: '/admin/reports',
      label: 'รายงานทีม & อนุมัติ',
      icon: FileBarChart,
    },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200/80 bg-white p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Main Navigation */}
          {!isAdmin && (
            <div>
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                เมนูหลัก
              </span>
              <nav className="mt-2 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}

          {/* Admin Management Section */}
          {isAdmin && (
            <div>
              <div className="flex items-center gap-1.5 px-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  ฝ่ายบุคคล (HR Admin)
                </span>
              </div>
              <nav className="mt-2 space-y-1">
                {adminItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
