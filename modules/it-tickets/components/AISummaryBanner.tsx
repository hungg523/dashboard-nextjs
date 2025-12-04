/**
 * Component hiển thị banner phân tích AI
 */

'use client'

import { Sparkles, Bot } from 'lucide-react'

interface AISummaryBannerProps {
  summary: string
  isLoading?: boolean
  onDetailedAnalysis?: () => void
}

export function AISummaryBanner({ summary, isLoading, onDetailedAnalysis }: AISummaryBannerProps) {
  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-100 rounded-xl p-5 relative overflow-hidden shadow-sm">
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
          <Bot className="w-6 h-6 text-white stroke-[1.5]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-blue-700 font-medium text-base">
              Phân tích Phiếu IT bởi AI
            </h3>
            <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </div>
          <div className="text-sm text-slate-700">
            {isLoading ? (
              <p className="text-slate-500 italic">Đang phân tích...</p>
            ) : (
              <p>{summary || 'Không có dữ liệu phân tích'}</p>
            )}
          </div>
        </div>
        {onDetailedAnalysis && (
          <button
            onClick={onDetailedAnalysis}
            className="text-blue-600 text-xs font-medium hover:underline whitespace-nowrap mt-1"
          >
            Phân tích chi tiết
          </button>
        )}
      </div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
    </div>
  )
}
