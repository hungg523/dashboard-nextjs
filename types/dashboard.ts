export interface DashboardKPI {
  period: string
  totalTickets: number
  completedTickets: number
  inProgressTickets: number
  pendingTickets: number
  completionRate: number
}

export interface AISummary {
  summary: string
  period: string
  model: string
  tokensUsed?: number
}

export interface TaskReminder {
  id: number
  maPhieu: string
  noiDung: string
  loaiYeuCau: string
  nguoiYeuCau: string
  ngayYeuCau: string
  daysOverdue: number
  reason: string
}

export interface TaskReminderSuggestion {
  summary: string
  statistics: {
    totalTasks: number
    overdueTasks: number
    newTasks: number
    inProgressTasks: number
  }
  suggestedTasks: TaskReminder[]
  generatedAt: string
}

export type Period = 'today' | 'this_week' | 'this_month' | 'all'

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface StatusDistribution {
  completed: number
  inProgress: number
  pending: number
}

export interface TrendDataPoint {
  month: string
  total: number
  completed: number
  completionRate: number
}

export interface TopItem {
  name: string
  count: number
  percentage?: number
}

export interface DashboardCharts {
  statusDistribution: StatusDistribution
  completionHistory: TrendDataPoint[]
  trendHistory: TrendDataPoint[]
  topHandlers: TopItem[]
  topDepartments: TopItem[]
  topRequesters: TopItem[]
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}
