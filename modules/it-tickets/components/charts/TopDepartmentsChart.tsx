/**
 * Danh sách top 5 bộ phận có nhiều phiếu nhất
 */
'use client'

import { useEffect, useState } from 'react'
import { TopDepartmentsData } from '@/modules/it-tickets/types'
import { ITTicketService } from '@/modules/it-tickets/services/ticket.service'
import { Building } from 'lucide-react'

export default function TopDepartmentsChart() {
  const [data, setData] = useState<TopDepartmentsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await ITTicketService.getTopDepartments(5)
      setData(result)
    } catch (error) {
      console.error('[TopDepartmentsChart] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-slate-400">
          <Building className="w-12 h-12 mx-auto mb-2 stroke-[1.5]" />
          <p className="text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!data || !data.departments || data.departments.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-slate-400">
          <Building className="w-12 h-12 mx-auto mb-2 stroke-[1.5]" />
          <p className="text-sm">Chưa có dữ liệu</p>
        </div>
      </div>
    )
  }

  const getRankClass = (index: number) => {
    if (index === 0) return 'bg-yellow-100 text-yellow-800'
    if (index === 1) return 'bg-slate-100 text-slate-800'
    return 'bg-orange-100 text-orange-800'
  }

  return (
    <ul className="space-y-3">
      {data.departments.map((dept, index) => (
        <li key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <span className={`flex items-center justify-center w-6 h-6 rounded-full ${getRankClass(index)} text-xs font-bold`}>
              {index + 1}
            </span>
            <span className="font-medium text-slate-700">{dept.name}</span>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
            {dept.count} phiếu
          </span>
        </li>
      ))}
    </ul>
  )
}
