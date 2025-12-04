/**
 * Component Loading Overlay
 */

'use client'

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-sm font-medium text-slate-700">Đang tải dữ liệu...</span>
      </div>
    </div>
  )
}
