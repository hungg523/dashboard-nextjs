/**
 * Component hiển thị reminder banner
 */

'use client'

import { Bell, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { TaskReminder } from '@/modules/it-tickets/types'
import { formatDate } from '@/modules/shared/utils/format'

interface ReminderBannerProps {
  reminders: TaskReminder[]
  isLoading?: boolean
}

export function ReminderBanner({ reminders, isLoading }: ReminderBannerProps) {
  return (
    <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
          <Bell className="w-5 h-5 text-white stroke-[2]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-orange-700 font-semibold text-base">Nhắc việc</h3>
              {reminders.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI
                </span>
              )}
            </div>
            <Link href="/reminders" className="text-orange-600 text-xs font-medium hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-700 bg-white px-3 py-2 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                <span>Đang tải dữ liệu nhắc việc...</span>
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-sm text-slate-600 bg-white px-3 py-2 rounded-lg">
                Không có nhắc việc nào
              </div>
            ) : (
              reminders.slice(0, 3).map((reminder, index) => (
                <div key={index} className="flex items-center justify-between text-sm bg-white px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 truncate">{reminder.loaiYeuCau}</div>
                    <div className="text-xs text-slate-500 truncate">{reminder.nguoiYeuCau} - {reminder.maPhieu}</div>
                  </div>
                  <div className="text-xs text-slate-600 ml-3">
                    {formatDate(reminder.ngayYeuCau)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
