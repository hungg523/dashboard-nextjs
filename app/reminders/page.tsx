'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Sparkles, UserPlus, FilePlus, Clock, AlertTriangle, User, Users, Calendar } from 'lucide-react'
import { Sidebar } from '@/modules/shared/components/Sidebar'
import { PageHeader } from '@/modules/shared/components/PageHeader'
import { PeriodFilter } from '@/modules/shared/components/PeriodFilter'
import { ChatbotSidebar } from '@/modules/shared/components/ChatbotSidebar'
import { ChatbotToggle } from '@/modules/shared/components/ChatbotToggle'
import { AssignmentsTable } from '@/modules/it-tickets/components/AssignmentsTable'
import { PriorityTable } from '@/modules/it-tickets/components/PriorityTable'
import { TeamAssignmentsView } from '@/modules/it-tickets/components/TeamAssignmentsView'
import { TeamPriorityView } from '@/modules/it-tickets/components/TeamPriorityView'
import { useAuth } from '@/modules/shared/hooks/useAuth'
import { usePeriodFilter } from '@/modules/shared/hooks/usePeriodFilter'
import { ITTicketService } from '@/modules/it-tickets/services/ticket.service'
import { AssignmentsData, PriorityData } from '@/modules/it-tickets/types'
import { API_ENDPOINTS } from '@/config/api.config'

export default function RemindersPage() {
  const router = useRouter()
  const { user, isAuthenticated, isITMember, isLoading: authLoading, logout } = useAuth()
  const { period, selectPeriod, periodDescription } = usePeriodFilter('this_month')
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [assignmentsData, setAssignmentsData] = useState<AssignmentsData | null>(null)
  const [priorityData, setPriorityData] = useState<PriorityData | null>(null)
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true)
  const [isLoadingPriority, setIsLoadingPriority] = useState(true)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState<'personal' | 'team'>('personal')
  const [teamAssignmentsData, setTeamAssignmentsData] = useState<any>(null)
  const [teamPriorityData, setTeamPriorityData] = useState<any>(null)
  const [isLoadingTeam, setIsLoadingTeam] = useState(false)
  const [teamError, setTeamError] = useState<string | null>(null)
  
  // Check if user is manager (IT member + Trưởng bộ phận)
  const isManager = isITMember && user?.chucVu === 'Trưởng bộ phận'

  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (authLoading) return
    if (isAuthenticated && user) {
      if (currentTab === 'personal') {
        loadAssignmentsData()
        loadPriorityData()
      }
    }
  }, [period, authLoading, isAuthenticated, user, currentTab])

  const loadAssignmentsData = async () => {
    if (!user) return
    
    setIsLoadingAssignments(true)
    try {
      const data = await ITTicketService.getAssignments(user.employeeId, period)
      console.log('[Reminders] Assignments data:', data)
      setAssignmentsData(data)
    } catch (error) {
      console.error('[Reminders] Error loading assignments:', error)
      setAssignmentsData(null)
    } finally {
      setIsLoadingAssignments(false)
    }
  }

  const loadPriorityData = async () => {
    if (!user) return
    
    setIsLoadingPriority(true)
    try {
      const data = await ITTicketService.getPriorityAnalysis(user.employeeId, period)
      console.log('[Reminders] Priority data:', data)
      setPriorityData(data)
    } catch (error) {
      console.error('[Reminders] Error loading priority:', error)
      setPriorityData(null)
    } finally {
      setIsLoadingPriority(false)
    }
  }

  const loadTeamData = async () => {
    if (!user || !isManager) {
      console.log('[Reminders] Skipping team data load - user or manager check failed', { user: !!user, isManager })
      return
    }
    
    setIsLoadingTeam(true)
    setTeamError(null)
    try {
      console.log('[Reminders] Loading team data for manager:', user.employeeId, 'period:', period)
      
      const assignmentsUrl = API_ENDPOINTS.taskReminderTeamAssignments(user.employeeId, period)
      const priorityUrl = API_ENDPOINTS.taskReminderTeamPriority(user.employeeId, period)
      
      console.log('[Reminders] Team assignments URL:', assignmentsUrl)
      console.log('[Reminders] Team priority URL:', priorityUrl)
      
      const [assignmentsResponse, priorityResponse] = await Promise.all([
        fetch(assignmentsUrl),
        fetch(priorityUrl)
      ])
      
      console.log('[Reminders] Assignments response status:', assignmentsResponse.status)
      console.log('[Reminders] Priority response status:', priorityResponse.status)
      
      if (!assignmentsResponse.ok) {
        const errorText = await assignmentsResponse.text()
        console.error('[Reminders] Team assignments API error:', assignmentsResponse.status, errorText)
        setTeamError(`Lỗi API (${assignmentsResponse.status}): ${errorText.substring(0, 200)}`)
        throw new Error(`Assignments API error: ${assignmentsResponse.status}`)
      }
      
      if (!priorityResponse.ok) {
        const errorText = await priorityResponse.text()
        console.error('[Reminders] Team priority API error:', priorityResponse.status, errorText)
        setTeamError(`Lỗi API (${priorityResponse.status}): ${errorText.substring(0, 200)}`)
        throw new Error(`Priority API error: ${priorityResponse.status}`)
      }
      
      const teamAssignments = await assignmentsResponse.json()
      const teamPriority = await priorityResponse.json()
      
      console.log('[Reminders] Team assignments data:', teamAssignments)
      console.log('[Reminders] Team priority data:', teamPriority)
      
      setTeamAssignmentsData(teamAssignments)
      setTeamPriorityData(teamPriority)
    } catch (error) {
      console.error('[Reminders] Error loading team data:', error)
      if (!teamError) {
        setTeamError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải dữ liệu team')
      }
      setTeamAssignmentsData(null)
      setTeamPriorityData(null)
    } finally {
      setIsLoadingTeam(false)
    }
  }

  const handleRefresh = async () => {
    if (!user) return
    
    setIsRefreshing(true)
    
    try {
      const refreshed = await ITTicketService.refreshTaskReminders(user.employeeId, period)
      if (refreshed) {
        if (currentTab === 'personal') {
          await Promise.all([loadAssignmentsData(), loadPriorityData()])
        } else {
          await loadTeamData()
        }
      }
    } catch (error) {
      console.error('[Reminders] Error refreshing:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSwitchTab = (tab: 'personal' | 'team') => {
    console.log('[Reminders] Switching tab to:', tab)
    setCurrentTab(tab)
    if (tab === 'team') {
      loadTeamData()
    }
  }

  if (authLoading || !isAuthenticated) {
    return null
  }

  const summaryParts = []
  if (currentTab === 'personal') {
    if (assignmentsData?.summary) summaryParts.push(assignmentsData.summary)
    if (priorityData?.summary) summaryParts.push(priorityData.summary)
  }

  return (
    <div className="bg-gray-50 text-slate-600 antialiased overflow-hidden h-screen flex text-base">
      <Sidebar user={user} onLogout={logout} isITMember={isITMember} />
      
      <main className="flex-1 flex flex-col h-full min-w-0 bg-[#f3f4f6]">
        <PageHeader title="Nhắc việc & Gợi ý công việc">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </PageHeader>

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
              />
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-700">{periodDescription}</span>
              </div>
            </div>
          </div>

          {/* Tab switcher for managers only */}
          {isManager && (
            <div className="mb-6">
              <div className="bg-white border border-slate-200 rounded-lg p-1 inline-flex gap-1">
                <button
                  onClick={() => handleSwitchTab('personal')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentTab === 'personal'
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-600 bg-transparent hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Cá nhân
                </button>
                <button
                  onClick={() => handleSwitchTab('team')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    currentTab === 'team'
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-600 bg-transparent hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Quản lý team
                </button>
              </div>
            </div>
          )}

          {/* Personal View */}
          {currentTab === 'personal' && (
            <div>
              {/* AI Summary */}
              <div className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-100 rounded-xl p-5 relative overflow-hidden shadow-sm">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                    <Sparkles className="w-6 h-6 text-white stroke-[1.5]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-slate-800">Gợi ý từ AI</h3>
                      <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
                    </div>
                    {isLoadingAssignments && isLoadingPriority ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-slate-700">Đang phân tích dữ liệu...</span>
                      </div>
                    ) : summaryParts.length === 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-start gap-2 text-sm text-slate-700">
                          <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Có 0 phiếu yêu cầu mới cần phân công xử lý</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-slate-700">
                          <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Bạn không có phiếu nào đang xử lý</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {summaryParts.map((part, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-slate-700 leading-relaxed">{part}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {/* Gợi ý phân công */}
                {isITMember && (
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-medium text-slate-700">Gợi ý phân công</h3>
                      <UserPlus className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-3xl font-semibold text-blue-600 tracking-tight">
                        {isLoadingAssignments ? '--' : (assignmentsData?.assignmentSuggestions?.length || 0)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">Phiếu cần phân công</div>
                  </div>
                )}

                {/* Phiếu mới */}
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-slate-700">Phiếu mới</h3>
                    <FilePlus className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-semibold text-green-600 tracking-tight">
                      {isLoadingAssignments ? '--' : (assignmentsData?.statistics?.newTasks || 0)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Chờ xử lý</div>
                </div>

                {/* Đang xử lý */}
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-slate-700">Đang xử lý</h3>
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-semibold text-orange-600 tracking-tight">
                      {isLoadingAssignments ? '--' : (assignmentsData?.statistics?.inProgress || 0)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Cần theo dõi</div>
                </div>

                {/* Quá hạn */}
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-slate-700">Quá hạn</h3>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-semibold text-red-600 tracking-tight">
                      {isLoadingAssignments ? '--' : (assignmentsData?.statistics?.overdue || 0)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Cần xử lý ngay</div>
                </div>
              </div>

              {/* Assignment Suggestions */}
              {isITMember && (
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Gợi ý phân công công việc</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {assignmentsData?.assignmentSuggestions?.length || 0} phiếu
                      </p>
                    </div>
                  </div>
                  <AssignmentsTable 
                    assignments={assignmentsData?.assignmentSuggestions || []}
                    isLoading={isLoadingAssignments}
                  />
                </div>
              )}

              {/* Priority Analysis */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Phân tích độ ưu tiên</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {priorityData?.prioritizedTasks?.length || 0} phiếu cần ưu tiên
                    </p>
                  </div>
                </div>
                <PriorityTable 
                  priorities={priorityData}
                  isLoading={isLoadingPriority}
                />
              </div>
            </div>
          )}

          {/* Team View */}
          {currentTab === 'team' && (
            <div>
              {teamError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-800 mb-1">Không thể tải dữ liệu team</h3>
                      <p className="text-sm text-red-700">{teamError}</p>
                      <p className="text-xs text-red-600 mt-2">
                        Vui lòng kiểm tra: 1) Tài khoản có chức vụ "Trưởng bộ phận" trong hệ thống, 2) Backend API đang chạy
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* AI Summary */}
              <div className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-100 rounded-xl p-5 relative overflow-hidden shadow-sm">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                    <Sparkles className="w-6 h-6 text-white stroke-[1.5]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-slate-800">Gợi ý từ AI</h3>
                      <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">Beta</span>
                    </div>
                    <div className="text-sm text-slate-700">
                      {isLoadingTeam ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Đang phân tích dữ liệu team...</span>
                        </div>
                      ) : teamError ? (
                        <div className="text-slate-500">Không có dữ liệu</div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{teamAssignmentsData?.summary || 'Có 0 phiếu yêu cầu mới cần phân công xử lý'}</span>
                          </div>
                          {teamPriorityData?.summary && (
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{teamPriorityData.summary}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
              </div>

              {/* Team Content */}
              <TeamAssignmentsView data={teamAssignmentsData} isLoading={isLoadingTeam} />
              
              <div className="mt-6">
                <TeamPriorityView data={teamPriorityData} isLoading={isLoadingTeam} />
              </div>
            </div>
          )}
        </div>
      </main>

      <ChatbotSidebar
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
      <ChatbotToggle onClick={() => setIsChatbotOpen(!isChatbotOpen)} />
    </div>
  )
}
