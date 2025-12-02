"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import dynamic from "next/dynamic"

// Disable SSR for dashboard to avoid hydration issues
export default dynamic(() => Promise.resolve(DashboardContent), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center bg-gray-50">Đang tải...</div>
})

function DashboardContent() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.push('/login')
      return
    }
    setIsLoaded(true)
  }, [router])

  useEffect(() => {
    if (isLoaded) {
      const checkScripts = setInterval(() => {
        if (typeof window !== 'undefined' && 
            (window as any).lucide && 
            (window as any).Chart) {
          (window as any).lucide.createIcons()
          setScriptsLoaded(true)
          clearInterval(checkScripts)
        }
      }, 100)

      return () => clearInterval(checkScripts)
    }
  }, [isLoaded])

  if (!isLoaded || !scriptsLoaded) {
    return <div className="w-full h-screen flex items-center justify-center bg-gray-50">Đang tải...</div>
  }

  return (
    <>
      <Script 
        src="https://cdn.tailwindcss.com" 
        strategy="beforeInteractive"
      />
      <Script 
        src="https://unpkg.com/lucide@latest" 
        strategy="beforeInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/chart.js" 
        strategy="beforeInteractive"
      />
      <Script 
        src="/js/app.js" 
        strategy="afterInteractive"
      />
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .hidden {
          display: none !important;
        }
      `}</style>

      <div className="bg-gray-50 text-slate-600 antialiased overflow-hidden h-screen flex text-base">
        <div id="chat-screen" className="w-full h-full flex">
          <aside className="w-64 bg-[#0f1c3f] text-slate-300 flex-shrink-0 flex flex-col h-full transition-all duration-300">
            <div className="h-14 flex items-center px-4 border-b border-slate-800/50">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3">
                <i data-lucide="layout-grid" className="w-5 h-5"></i>
              </div>
              <span className="text-white font-medium text-lg tracking-tight">MLG IT</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600 text-white rounded-md group">
                <i data-lucide="monitor-check" className="w-5 h-5 stroke-[1.5]"></i>
                <span className="text-sm font-medium">Phiếu IT</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
                <i data-lucide="users" className="w-5 h-5 stroke-[1.5]"></i>
                <span className="text-sm font-medium">Nhân sự</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
                <i data-lucide="shopping-cart" className="w-5 h-5 stroke-[1.5]"></i>
                <span className="text-sm font-medium">Mua hàng</span>
              </a>
            </div>

            <div className="p-4 border-t border-slate-800/50">
              <div className="flex items-center gap-3 text-slate-300 mb-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  <span id="user-avatar">NV</span>
                </div>
                <span id="user-name" className="text-sm font-medium">User</span>
              </div>
              <button id="btn-logout" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm w-full">
                <i data-lucide="log-out" className="w-4 h-4"></i>
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>

          <main className="flex-1 flex flex-col h-full min-w-0 bg-[#f3f4f6]">
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
              <div className="flex items-center gap-4 flex-1">
                <h1 className="text-lg font-medium text-slate-800">Phiếu yêu cầu IT</h1>
                <div className="relative w-full max-w-md ml-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i data-lucide="search" className="w-4 h-4 text-gray-400 stroke-[1.5]"></i>
                  </div>
                  <input type="text" className="block w-full pl-10 pr-3 py-1.5 border border-gray-200 rounded-md leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all" placeholder="Tìm kiếm phiếu IT..." />
                </div>
              </div>

            </header>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <i data-lucide="calendar" className="w-5 h-5 text-slate-500"></i>
                    <span className="text-sm font-medium">Thời gian:</span>
                  </div>
                  <div className="relative">
                    <button id="period-filter-btn" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                      <span id="period-filter-text">Tháng này</span>
                      <i data-lucide="chevron-down" className="w-4 h-4"></i>
                    </button>
                    <div id="period-filter-dropdown" className="hidden absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[160px]">
                      <button data-period="today" className="period-option w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between">
                        <span>Hôm nay</span>
                        <i data-lucide="check" className="w-4 h-4 period-check today text-transparent"></i>
                      </button>
                      <button data-period="this_week" className="period-option w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between">
                        <span>Tuần này</span>
                        <i data-lucide="check" className="w-4 h-4 period-check this_week text-transparent"></i>
                      </button>
                      <button data-period="this_month" className="period-option w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between">
                        <span>Tháng này</span>
                        <i data-lucide="check" className="w-4 h-4 period-check this_month text-blue-600"></i>
                      </button>
                      <button data-period="all" className="period-option w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between rounded-b-lg">
                        <span>Tất cả</span>
                        <i data-lucide="check" className="w-4 h-4 period-check all text-transparent"></i>
                      </button>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm font-medium text-blue-700" id="current-period-label">Tháng 12/2025</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-100 rounded-xl p-5 relative overflow-hidden shadow-sm">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                    <i data-lucide="bot" className="w-6 h-6 text-white stroke-[1.5]"></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-blue-700 font-medium text-base">Phân tích từ AI</h3>
                      <i data-lucide="sparkles" className="w-4 h-4 text-yellow-500 fill-yellow-500"></i>
                    </div>
                    <div id="ai-summary" className="text-sm text-slate-700">
                      <p className="text-slate-500 italic">Đang phân tích...</p>
                    </div>
                  </div>
                  <button 
                    id="btn-detailed-analysis" 
                    onClick={() => {
                      if (typeof window !== 'undefined' && (window as any).openDetailedAnalysis) {
                        (window as any).openDetailedAnalysis()
                      }
                    }}
                    className="text-blue-600 text-xs font-medium hover:underline whitespace-nowrap mt-1"
                  >
                    Phân tích chi tiết
                  </button>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-slate-700">Tổng phiếu</h3>
                    <i data-lucide="ticket" className="w-5 h-5 text-slate-400"></i>
                  </div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span id="kpi-total" className="text-3xl font-semibold text-slate-800 tracking-tight">--</span>
                  </div>
                  <div id="kpi-total-label" className="text-xs text-slate-500">Đang tải...</div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-slate-700">Đã hoàn thành</h3>
                    <i data-lucide="check-circle" className="w-5 h-5 text-emerald-500"></i>
                  </div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span id="kpi-completed" className="text-3xl font-semibold text-emerald-600 tracking-tight">--</span>
                  </div>
                  <div id="kpi-completed-label" className="text-xs text-slate-500">Đang tải...</div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-slate-700">Đang xử lý</h3>
                    <i data-lucide="clock" className="w-5 h-5 text-blue-500"></i>
                  </div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span id="kpi-in-progress" className="text-3xl font-semibold text-blue-600 tracking-tight">--</span>
                  </div>
                  <div id="kpi-in-progress-label" className="text-xs text-slate-500">Đang tải...</div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-slate-700">Chờ xử lý</h3>
                    <i data-lucide="alert-circle" className="w-5 h-5 text-orange-500"></i>
                  </div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span id="kpi-pending" className="text-3xl font-semibold text-orange-600 tracking-tight">--</span>
                  </div>
                  <div id="kpi-pending-label" className="text-xs text-slate-500">Đang tải...</div>
                </div>
              </div>

              <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <i data-lucide="bell" className="w-5 h-5 text-white stroke-[2]"></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-orange-700 font-semibold text-base">Nhắc việc</h3>
                      <button 
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.open('/task.html', '_blank')
                          }
                        }}
                        className="text-orange-600 text-xs font-medium hover:underline"
                      >
                        Xem tất cả
                      </button>
                    </div>
                    <div className="space-y-2" id="reminder-list">
                      <div className="flex items-center gap-2 text-sm text-slate-700 bg-white px-3 py-2 rounded-lg">
                        <i data-lucide="circle" className="w-3 h-3 text-orange-500 fill-orange-500"></i>
                        <span className="flex-1">Phiếu chờ xử lý: <strong id="reminder-pending-count">0</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 bg-white px-3 py-2 rounded-lg">
                        <i data-lucide="circle" className="w-3 h-3 text-blue-500 fill-blue-500"></i>
                        <span className="flex-1">Phiếu đang xử lý: <strong id="reminder-inprogress-count">0</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="text-sm font-semibold text-slate-800">Phân loại phiếu theo trạng thái</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).refreshChart) { (window as any).refreshChart('status', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Làm mới">
                        <i data-lucide="refresh-cw" className="w-4 h-4 text-slate-500"></i>
                      </button>
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).exportChartData) { (window as any).exportChartData('status', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Xuất Excel">
                        <i data-lucide="download" className="w-4 h-4 text-slate-500"></i>
                      </button>
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).fullscreenChart) { (window as any).fullscreenChart('chart-status-container', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Phóng to">
                        <i data-lucide="maximize-2" className="w-4 h-4 text-slate-500"></i>
                      </button>
                    </div>
                  </div>
                  <div id="chart-status-container" className="p-6">
                    <div style={{ height: '300px', position: 'relative' }}>
                      <canvas id="chart-status"></canvas>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="text-sm font-semibold text-slate-800">Tỷ lệ hoàn thành</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).refreshChart) { (window as any).refreshChart('completion', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Làm mới">
                        <i data-lucide="refresh-cw" className="w-4 h-4 text-slate-500"></i>
                      </button>
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).exportChartData) { (window as any).exportChartData('completion', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Xuất Excel">
                        <i data-lucide="download" className="w-4 h-4 text-slate-500"></i>
                      </button>
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).fullscreenChart) { (window as any).fullscreenChart('chart-completion-container', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Phóng to">
                        <i data-lucide="maximize-2" className="w-4 h-4 text-slate-500"></i>
                      </button>
                    </div>
                  </div>
                  <div id="chart-completion-container" className="p-6">
                    <div style={{ height: '300px', position: 'relative' }}>
                      <canvas id="chart-completion"></canvas>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="text-sm font-semibold text-slate-800">Xu hướng phiếu IT</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).refreshChart) { (window as any).refreshChart('trend', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Làm mới">
                        <i data-lucide="refresh-cw" className="w-4 h-4 text-slate-500"></i>
                      </button>
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).exportChartData) { (window as any).exportChartData('trend', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Xuất Excel">
                        <i data-lucide="download" className="w-4 h-4 text-slate-500"></i>
                      </button>
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).fullscreenChart) { (window as any).fullscreenChart('chart-trend-container', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Phóng to">
                        <i data-lucide="maximize-2" className="w-4 h-4 text-slate-500"></i>
                      </button>
                    </div>
                  </div>
                  <div id="chart-trend-container" className="p-6">
                    <div style={{ height: '300px', position: 'relative' }}>
                      <canvas id="chart-trend"></canvas>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="text-sm font-semibold text-slate-800">Top 5 người xử lý nhiều phiếu nhất</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).refreshChart) { (window as any).refreshChart('handlers', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Làm mới">
                        <i data-lucide="refresh-cw" className="w-4 h-4 text-slate-500"></i>
                      </button>
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).exportChartData) { (window as any).exportChartData('handlers', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Xuất Excel">
                        <i data-lucide="download" className="w-4 h-4 text-slate-500"></i>
                      </button>
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).fullscreenChart) { (window as any).fullscreenChart('chart-handlers-container', e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Phóng to">
                        <i data-lucide="maximize-2" className="w-4 h-4 text-slate-500"></i>
                      </button>
                    </div>
                  </div>
                  <div id="chart-handlers-container" className="p-6">
                    <div style={{ height: '300px', position: 'relative' }}>
                      <canvas id="chart-handlers"></canvas>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="text-sm font-semibold text-slate-800">Top 5 bộ phận có nhiều phiếu nhất</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).refreshTopDepartments) { (window as any).refreshTopDepartments(e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Làm mới">
                        <i data-lucide="refresh-cw" className="w-4 h-4 text-slate-500"></i>
                      </button>
                    </div>
                  </div>
                  <div id="top-departments-container" className="p-6">
                    <div className="space-y-4"></div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="text-sm font-semibold text-slate-800">Top 5 người tạo yêu cầu nhiều nhất</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { if (typeof window !== 'undefined' && (window as any).refreshTopRequesters) { (window as any).refreshTopRequesters(e) } }} className="p-1.5 hover:bg-white rounded transition-colors" title="Làm mới">
                        <i data-lucide="refresh-cw" className="w-4 h-4 text-slate-500"></i>
                      </button>
                    </div>
                  </div>
                  <div id="top-requesters-container" className="p-6">
                    <div className="space-y-4"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <div id="chat-sidebar" className="w-[400px] bg-white border-l border-gray-200 shadow-xl z-20 hidden flex-col h-full flex-shrink-0">
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <i data-lucide="bot" className="w-5 h-5 text-white stroke-[1.5]"></i>
                </div>
                <span className="font-medium text-slate-800">Phân tích với AI</span>
              </div>
              <button id="close-chat-btn" className="text-slate-400 hover:text-slate-600">
                <i data-lucide="x" className="w-5 h-5 stroke-[1.5]"></i>
              </button>
            </div>

            <div id="chat-messages" className="flex-1 overflow-y-auto p-5 bg-gray-50/30"></div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="relative">
                <textarea id="user-input" placeholder="Nhập câu hỏi..." rows={1} className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"></textarea>
                <button id="send-btn" className="absolute right-1.5 top-1.5 p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                  <i data-lucide="send-horizontal" className="w-5 h-5 stroke-[1.5]"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button id="chatbot-toggle" className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all z-40 flex items-center justify-center">
          <i data-lucide="bot" className="w-7 h-7"></i>
        </button>

        <div id="chatbot-sidebar" className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl transform translate-x-full transition-transform duration-300 z-50 flex flex-col"></div>

        <div id="analysis-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <i data-lucide="sparkles" className="w-6 h-6 text-white"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Phân tích Chi tiết bởi AI</h2>
                  <p className="text-xs text-slate-500">Phân tích chuyên sâu từ dữ liệu phiếu IT</p>
                </div>
              </div>
              <button id="close-analysis-modal" className="text-slate-400 hover:text-slate-600 transition-colors">
                <i data-lucide="x" className="w-6 h-6"></i>
              </button>
            </div>
            <div id="analysis-content" className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
