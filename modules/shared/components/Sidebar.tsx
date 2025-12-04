/**
 * Component Sidebar chung cho toàn hệ thống
 */

'use client'

import { ChevronDown, LayoutGrid, MonitorCheck, Users, ShoppingCart, LogOut, BarChart3, List, Bell } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@/modules/shared/types/user'
import { getInitials } from '@/modules/shared/utils/format'

interface SidebarProps {
  user: User | null
  onLogout: () => void
  isITMember?: boolean
}

export function Sidebar({ user, onLogout, isITMember = false }: SidebarProps) {
  const pathname = usePathname()
  const [isITMenuOpen, setIsITMenuOpen] = useState(true)

  const userInitials = user ? getInitials(user.fullName) : 'U'

  return (
    <aside className="w-64 bg-[#0f1c3f] text-slate-300 flex-shrink-0 flex flex-col h-full transition-all duration-300">
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b border-slate-800/50">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3">
          <LayoutGrid className="w-5 h-5" />
        </div>
        <span className="text-white font-medium text-lg tracking-tight">MLG BMIS</span>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {/* Phiếu IT Menu */}
        <div className="sidebar-menu-item">
          <button
            onClick={() => setIsITMenuOpen(!isITMenuOpen)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-md transition-colors ${
              pathname.includes('/overview') || pathname.includes('/reminders')
                ? 'bg-blue-600 text-white'
                : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <MonitorCheck className="w-5 h-5 stroke-[1.5]" />
              <span className="text-sm font-medium">Phiếu IT</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isITMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Submenu */}
          <div
            className={`ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
              isITMenuOpen ? 'max-h-96' : 'max-h-0'
            }`}
          >
            {isITMember && (
              <Link
                href="/overview"
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                  pathname === '/overview'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Tổng quan</span>
              </Link>
            )}

            {isITMember && (
              <Link
                href="/tickets"
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                  pathname === '/tickets'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Danh sách phiếu</span>
              </Link>
            )}

            <Link
              href="/reminders"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                pathname === '/reminders'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Nhắc việc</span>
            </Link>
          </div>
        </div>

        {/* Nhân sự */}
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 hover:text-white hover:bg-slate-800/50 rounded-md transition-colors"
        >
          <Users className="w-5 h-5 stroke-[1.5]" />
          <span className="text-sm font-medium">Nhân sự</span>
        </Link>

        {/* Mua hàng */}
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 hover:text-white hover:bg-slate-800/50 rounded-md transition-colors"
        >
          <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
          <span className="text-sm font-medium">Mua hàng</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="flex items-center gap-3 text-slate-300 mb-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            <span>{userInitials}</span>
          </div>
          <span className="text-sm font-medium truncate">{user?.fullName || 'User'}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
