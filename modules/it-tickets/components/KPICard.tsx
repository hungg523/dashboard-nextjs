/**
 * Component hiển thị KPI card
 */

'use client'

import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: number | string
  icon: LucideIcon
  label?: string
  valueColor?: string
  iconColor?: string
  isLoading?: boolean
}

export function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  label, 
  valueColor = 'text-slate-800',
  iconColor = 'text-slate-400',
  isLoading 
}: KPICardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-slate-700">{title}</h3>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex items-baseline gap-3 mb-1">
        <span className={`text-3xl font-semibold tracking-tight ${valueColor}`}>
          {isLoading ? '--' : value}
        </span>
      </div>
      <div className="text-xs text-slate-500">
        {isLoading ? 'Đang tải...' : (label || '')}
      </div>
    </div>
  )
}
