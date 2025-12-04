'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Ticket, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react'
import { Sidebar } from '@/modules/shared/components/Sidebar'
import { PageHeader } from '@/modules/shared/components/PageHeader'
import { PeriodFilter } from '@/modules/shared/components/PeriodFilter'
import { LoadingOverlay } from '@/modules/shared/components/LoadingOverlay'
import { ChatbotSidebar } from '@/modules/shared/components/ChatbotSidebar'
import { ChatbotToggle } from '@/modules/shared/components/ChatbotToggle'
import { AISummaryBanner } from '@/modules/it-tickets/components/AISummaryBanner'
import { KPICard } from '@/modules/it-tickets/components/KPICard'
import { ReminderBanner } from '@/modules/it-tickets/components/ReminderBanner'
import { 
  StatusChart, 
  CompletionChart, 
  TrendChart, 
  TopHandlersChart, 
  TopDepartmentsChart, 
  TopRequestersChart 
} from '@/modules/it-tickets/components/charts'
import { useAuth } from '@/modules/shared/hooks/useAuth'
import { usePeriodFilter } from '@/modules/shared/hooks/usePeriodFilter'
import { ITTicketService } from '@/modules/it-tickets/services/ticket.service'
import { DashboardKPI, TaskReminder } from '@/modules/it-tickets/types'

export default function OverviewPage() {
  const router = useRouter()
  const { user, isAuthenticated, isITMember, isLoading: authLoading, logout } = useAuth()
  const { period, selectPeriod, periodDescription } = usePeriodFilter('this_month')
  
  const [isLoadingKPI, setIsLoadingKPI] = useState(true)
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [kpiData, setKpiData] = useState<DashboardKPI | null>(null)
  const [aiSummary, setAiSummary] = useState('')
  const [reminders, setReminders] = useState<TaskReminder[]>([])
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (!isITMember) {
      router.push('/reminders')
      return
    }
  }, [authLoading, isAuthenticated, isITMember, router])

  useEffect(() => {
    if (authLoading) return
    if (isAuthenticated && isITMember) {
      loadKPIData()
      loadAISummary()
    }
  }, [period, authLoading, isAuthenticated, isITMember])

  const loadKPIData = async () => {
    setIsLoadingKPI(true)
    try {
      const kpi = await ITTicketService.getDashboardKPI(period)
      if (kpi) setKpiData(kpi)
    } catch (error) {
      console.error('[Overview] Error loading KPI:', error)
    } finally {
      setIsLoadingKPI(false)
    }
  }

  const loadAISummary = async () => {
    setIsLoadingSummary(true)
    try {
      const summary = await ITTicketService.getAISummary(period)
      if (summary) setAiSummary(summary)
    } catch (error) {
      console.error('[Overview] Error loading AI summary:', error)
    } finally {
      setIsLoadingSummary(false)
    }
  }

  if (authLoading || !isAuthenticated || !isITMember) {
    return null
  }

  return (
    <div className="bg-gray-50 text-slate-600 antialiased overflow-hidden h-screen flex text-base">
      <Sidebar user={user} onLogout={logout} isITMember={isITMember} />
      
      <main className="flex-1 flex flex-col h-full min-w-0 bg-[#f3f4f6]">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-lg font-medium text-slate-800">Tổng quan phiếu IT</h1>
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400 stroke-[1.5]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-1.5 border border-gray-200 rounded-md leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
                placeholder="Tìm kiếm phiếu IT..."
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Period Filter */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-medium">Thời gian:</span>
              </div>
              <PeriodFilter
                value={period}
                onChange={selectPeriod}
                description={periodDescription}
              />
            </div>
          </div>

          {/* AI Analysis Banner */}
          <AISummaryBanner
            summary={aiSummary}
            isLoading={isLoadingSummary}
          />

          {/* KPI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <KPICard
              title="Tổng phiếu"
              value={kpiData?.totalTickets || 0}
              icon={Ticket}
              label={kpiData?.period || periodDescription}
              isLoading={isLoadingKPI}
            />
            
            <KPICard
              title="Đã hoàn thành"
              value={kpiData?.completedTickets || 0}
              icon={CheckCircle}
              label={`Tỷ lệ ${kpiData?.completionRate?.toFixed(1) || 0}%`}
              valueColor="text-emerald-600"
              iconColor="text-emerald-500"
              isLoading={isLoadingKPI}
            />
            
            <KPICard
              title="Đang xử lý"
              value={kpiData?.inProgressTickets || 0}
              icon={Clock}
              label={`Chiếm ${kpiData ? ((kpiData.inProgressTickets / kpiData.totalTickets) * 100).toFixed(1) : 0}%`}
              valueColor="text-blue-600"
              iconColor="text-blue-500"
              isLoading={isLoadingKPI}
            />
            
            <KPICard
              title="Chờ xử lý"
              value={kpiData?.pendingTickets || 0}
              icon={AlertCircle}
              label={`Chiếm ${kpiData ? ((kpiData.pendingTickets / kpiData.totalTickets) * 100).toFixed(1) : 0}%`}
              valueColor="text-orange-600"
              iconColor="text-orange-500"
              isLoading={isLoadingKPI}
            />
          </div>

          {/* Reminder Section */}
          <ReminderBanner
            reminders={reminders}
            isLoading={false}
          />

          {/* Charts Grid - 2x3 Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Chart 1 - Donut Chart Status */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-slate-800">Phân loại phiếu theo trạng thái</h3>
              </div>
              <div className="p-6">
                {kpiData && <StatusChart data={kpiData} />}
              </div>
            </div>

            {/* Chart 2 - Line Chart Completion Rate */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-slate-800">Tỷ lệ hoàn thành</h3>
              </div>
              <div className="p-6">
                <CompletionChart />
              </div>
            </div>

            {/* Chart 3 - Line Chart Trend */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-slate-800">Xu hướng phiếu IT</h3>
              </div>
              <div className="p-6">
                <TrendChart />
              </div>
            </div>

            {/* Chart 4 - Horizontal Bar Top Handlers */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-slate-800">Top 5 người xử lý nhiều phiếu nhất</h3>
              </div>
              <div className="p-6">
                <TopHandlersChart />
              </div>
            </div>

            {/* Chart 5 - Top Departments */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-slate-800">Top 5 bộ phận có nhiều phiếu nhất</h3>
              </div>
              <div className="p-6">
                <TopDepartmentsChart />
              </div>
            </div>

            {/* Chart 6 - Top Requesters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-slate-800">Top 5 người tạo yêu cầu nhiều nhất</h3>
              </div>
              <div className="p-6">
                <TopRequestersChart />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chatbot Toggle & Sidebar */}
      <ChatbotToggle onClick={() => setIsChatbotOpen(true)} />
      <ChatbotSidebar
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        userId={user?.employeeId}
      />
    </div>
  )
}
