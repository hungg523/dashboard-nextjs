import React from 'react'
import { AlertCircle } from 'lucide-react'
import { PriorityData } from '../types'

interface PriorityTableProps {
  priorities: PriorityData | null
  isLoading: boolean
}

export function PriorityTable({ priorities, isLoading }: PriorityTableProps) {
  const priorityItems = priorities?.prioritizedTasks || []

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Phân tích độ ưu tiên</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <AlertCircle className="w-4 h-4" />
            <span>
              {isLoading ? 'Đang tải...' : `${priorityItems.length} phiếu cần ưu tiên`}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Phiếu
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Nội dung
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Độ ưu tiên
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Phân tích
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-slate-500">Đang phân tích độ ưu tiên...</span>
                  </div>
                </td>
              </tr>
            ) : priorityItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-12 h-12 text-gray-300" />
                    <span className="text-sm text-slate-500">Không có phiếu cần ưu tiên</span>
                  </div>
                </td>
              </tr>
            ) : (
              priorityItems.map((item, index) => {
                const priorityText = item.priorityLevel === 'High' ? 'Cao' : item.priorityLevel === 'Medium' ? 'Trung bình' : 'Thấp'
                const priorityClass = item.priorityLevel === 'High' ? 'bg-red-100 text-red-700' : item.priorityLevel === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">{item.maPhieu}</div>
                      <div className="text-xs text-slate-500 mt-1">{item.loaiYeuCau}</div>
                      {item.daysOverdue > 0 && (
                        <div className="text-xs text-red-600 font-medium mt-1">Quá hạn {item.daysOverdue} ngày</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{item.noiDungYeuCau}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClass}`}>
                        {priorityText}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">{item.priorityScore} điểm</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                        {item.reasoning}
                      </div>
                      {item.complexityLevel && (
                        <div className="text-xs text-slate-500 mt-2">
                          Độ phức tạp: <span className="font-medium">{item.complexityLevel}</span> | Ước tính: <span className="font-medium">{item.estimatedMinutes || 0} phút</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
