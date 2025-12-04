/**
 * Component hiển thị bảng phân công công việc
 */

'use client'

import { AssignmentSuggestion } from '@/modules/it-tickets/types'
import { escapeHtml, getInitials, getRandomColor } from '@/modules/shared/utils/format'

interface AssignmentsTableProps {
  assignments: AssignmentSuggestion[]
  isLoading?: boolean
}

export function AssignmentsTable({ assignments, isLoading }: AssignmentsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800">Gợi ý phân công công việc</h3>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">0</span>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-slate-500 mt-4">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Gợi ý phân công công việc</h3>
        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
          {assignments.length}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="uppercase text-xs font-medium text-slate-500 tracking-wider px-5 py-3">
                Phiếu
              </th>
              <th className="uppercase text-xs font-medium text-slate-500 tracking-wider px-4 py-3">
                Nội dung
              </th>
              <th className="uppercase text-xs font-medium text-slate-500 tracking-wider px-4 py-3">
                Gợi ý
              </th>
              <th className="uppercase text-xs font-medium text-slate-500 tracking-wider px-4 py-3 text-center">
                Độ tin cậy
              </th>
              <th className="uppercase text-xs font-medium text-slate-500 tracking-wider px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400 italic text-xs">
                  <div className="flex flex-col items-center gap-2">
                    Không có phiếu nào cần phân công
                  </div>
                </td>
              </tr>
            ) : (
              assignments.map((item, index) => {
                const confidencePercent = Math.round(item.confidence * 100)
                const confidenceClass = confidencePercent >= 80 
                  ? 'text-green-600 bg-green-50 border-green-200' 
                  : confidencePercent >= 60 
                  ? 'text-orange-600 bg-orange-50 border-orange-200' 
                  : 'text-red-600 bg-red-50 border-red-200'
                
                return (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-slate-700">{item.maPhieu}</div>
                      <div className="text-xs text-slate-500 mt-1">{item.loaiYeuCau}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-700 line-clamp-2">
                        {item.noiDung || item.mucDichSuDung}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${getRandomColor()}`}>
                          {getInitials(item.suggestedUserName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-700 mb-1">
                            {item.suggestedUserName}
                          </div>
                          <div className="text-xs text-slate-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                            {item.reasoning || 'AI gợi ý phân công cho nhân viên này'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-block border ${confidenceClass}`}>
                        {confidencePercent}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                        Phân công
                      </button>
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
