/**
 * Service xử lý các API liên quan đến phiếu IT và task reminders
 */

import { 
  TaskReminderData, 
  AssignmentsData, 
  PriorityData,
  DashboardData,
  DashboardKPI,
  Period,
  CompletionChartData,
  TrendChartData,
  TopHandlersData,
  TopDepartmentsData,
  TopRequestersData
} from '@/modules/it-tickets/types'
import { API_ENDPOINTS } from '@/config/api.config'

export class ITTicketService {
  /**
   * Lấy gợi ý công việc cho user
   */
  static async getTaskReminders(userId: number, period: Period = 'this_month'): Promise<TaskReminderData | null> {
    try {
      const response = await fetch(
        API_ENDPOINTS.taskReminderSuggestions(userId, period)
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('[ITTicketService] Error fetching task reminders:', error)
      return null
    }
  }

  /**
   * Làm mới gợi ý công việc
   */
  static async refreshTaskReminders(userId: number, period: Period = 'this_month'): Promise<TaskReminderData | null> {
    try {
      const response = await fetch(
        API_ENDPOINTS.taskReminderRefresh(userId, period),
        { method: 'POST' }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('[ITTicketService] Error refreshing task reminders:', error)
      return null
    }
  }

  /**
   * Lấy danh sách phân công công việc
   */
  static async getAssignments(userId: number, period: Period = 'this_month'): Promise<AssignmentsData | null> {
    try {
      const response = await fetch(
        API_ENDPOINTS.taskReminderAssignments(userId, period)
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('[ITTicketService] Error fetching assignments:', error)
      return null
    }
  }

  /**
   * Lấy phân tích độ ưu tiên công việc
   */
  static async getPriorityAnalysis(userId: number, period: Period = 'this_month'): Promise<PriorityData | null> {
    try {
      const response = await fetch(
        API_ENDPOINTS.taskReminderPriorityAnalysis(userId, period)
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('[ITTicketService] Error fetching priority analysis:', error)
      return null
    }
  }

  /**
   * Lấy dữ liệu dashboard KPI
   */
  static async getDashboardKPI(period: Period = 'this_month'): Promise<DashboardKPI | null> {
    try {
      const response = await fetch(
        API_ENDPOINTS.dashboardKPI(period)
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      // API trả về trực tiếp object KPI
      if (result && result.totalTickets !== undefined) {
        return result
      }
      
      // Hoặc có thể có wrapper success/data
      return result.success ? result.data : null
    } catch (error) {
      console.error('[ITTicketService] Error fetching dashboard KPI:', error)
      return null
    }
  }

  /**
   * Lấy tóm tắt AI cho dashboard
   */
  static async getAISummary(period: Period = 'this_month'): Promise<string> {
    try {
      const response = await fetch(
        API_ENDPOINTS.dashboardAISummary(period)
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      // API trả về {summary: "..."} hoặc {success, data: "..."}
      if (result.summary) {
        return result.summary
      }
      
      if (result.success && result.data) {
        return result.data
      }
      
      return 'Không có thông tin tóm tắt'
    } catch (error) {
      console.error('[ITTicketService] Error fetching AI summary:', error)
      return 'Không thể tải tóm tắt AI'
    }
  }

  /**
   * Lấy dữ liệu biểu đồ tỷ lệ hoàn thành theo tháng
   */
  static async getCompletionHistory(months: number = 6): Promise<CompletionChartData | null> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.completionHistory}?months=${months}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('[ITTicketService] Error fetching completion history:', error)
      return null
    }
  }

  /**
   * Lấy dữ liệu biểu đồ xu hướng phiếu IT
   */
  static async getTrendHistory(months: number = 6): Promise<TrendChartData | null> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.trendHistory}?months=${months}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('[ITTicketService] Error fetching trend history:', error)
      return null
    }
  }

  /**
   * Lấy dữ liệu top 5 người xử lý
   */
  static async getTopHandlers(limit: number = 5): Promise<TopHandlersData | null> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.topHandlers}?limit=${limit}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('[ITTicketService] Error fetching top handlers:', error)
      return null
    }
  }

  /**
   * Lấy dữ liệu top 5 bộ phận
   */
  static async getTopDepartments(limit: number = 5): Promise<TopDepartmentsData | null> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.topDepartments}?limit=${limit}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('[ITTicketService] Error fetching top departments:', error)
      return null
    }
  }

  /**
   * Lấy dữ liệu top 5 người tạo yêu cầu
   */
  static async getTopRequesters(limit: number = 5): Promise<TopRequestersData | null> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.topRequesters}?limit=${limit}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('[ITTicketService] Error fetching top requesters:', error)
      return null
    }
  }
}
