/**
 * Định nghĩa các kiểu dữ liệu cho module phiếu IT
 */

export interface TaskReminder {
  id: number
  maPhieu: string
  loaiYeuCau: string
  noiDung: string
  nguoiYeuCau: string
  ngayYeuCau: string
  trangThai?: string
  priority?: string
  reason?: string
  mucDichSuDung?: string
}

export interface SuggestedTask extends TaskReminder {
  suggestedUserName: string
  reasoning: string
  confidence: number
}

export interface TaskStatistics {
  totalPending: number
  overdue: number
  newTasks: number
  inProgress: number
}

export interface TaskReminderData {
  summary: string
  statistics: TaskStatistics
  suggestedTasks: SuggestedTask[]
  newTasks: TaskReminder[]
  inProgressTasks: TaskReminder[]
  lastUpdated: string
}

export interface AssignmentSuggestion {
  maPhieu: string
  loaiYeuCau: string
  noiDung: string
  mucDichSuDung?: string
  suggestedUserName: string
  reasoning: string
  confidence: number
}

export interface AssignmentsData {
  summary: string
  statistics: TaskStatistics
  assignmentSuggestions: AssignmentSuggestion[]
  pendingApproval: TaskReminder[]
}

export interface PriorityTask {
  id: number
  maPhieu: string
  noiDungYeuCau: string
  mucDichSuDung?: string
  loaiYeuCau: string
  nguoiYeuCau: string
  ngayYeuCau: string
  trangThai: string
  daysOverdue: number
  priorityLevel: 'High' | 'Medium' | 'Low'
  priorityScore: number
  confidence: number
  reasoning: string
  complexityLevel?: string
  estimatedMinutes?: number
}

export interface PriorityData {
  summary: string
  prioritizedTasks: PriorityTask[]
  analyzedAt: string
}

export interface DashboardKPI {
  period?: string
  totalTickets: number
  completedTickets: number
  inProgressTickets: number
  pendingTickets: number
  completionRate?: number
  newTickets?: number
  overdue?: number
  completed?: number
  inProgress?: number
  avgResponseTime?: number
}

export interface DashboardData {
  kpi: DashboardKPI
  aiSummary: string
  recentTickets: TaskReminder[]
  trends?: {
    labels: string[]
    data: number[]
  }
}

export type Period = 'today' | 'this_week' | 'this_month' | 'all'

/**
 * Dữ liệu biểu đồ hoàn thành theo tháng
 */
export interface CompletionChartData {
  months: string[]
  completionRates: number[]
}

/**
 * Dữ liệu biểu đồ xu hướng
 */
export interface TrendChartData {
  months: string[]
  total: number[]
  completed: number[]
}

/**
 * Dữ liệu top handlers
 */
export interface TopHandlersData {
  handlers: string[]
  totalCounts: number[]
  completedCounts: number[]
}

/**
 * Item trong danh sách top departments hoặc requesters
 */
export interface TopItem {
  name: string
  count: number
}

/**
 * Dữ liệu top departments
 */
export interface TopDepartmentsData {
  departments: TopItem[]
}

/**
 * Dữ liệu top requesters
 */
export interface TopRequestersData {
  requesters: TopItem[]
}
