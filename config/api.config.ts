// API Base URL từ environment variable hoặc default
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// API Endpoints
export const API_ENDPOINTS = {
  // Dashboard
  dashboardKPI: `${API_BASE_URL}/api/dashboard/kpi-summary`,
  dashboardAISummary: `${API_BASE_URL}/api/dashboard/ai-summary`,
  dashboardBase: `${API_BASE_URL}/api/dashboard`,
  
  // Task Reminders
  taskReminderSuggestions: (userId: number, period: string) => 
    `${API_BASE_URL}/api/task-reminder/suggestions?userId=${userId}&period=${period}`,
  taskReminderRefresh: (userId: number, period: string) => 
    `${API_BASE_URL}/api/task-reminder/refresh?userId=${userId}&period=${period}`,
  taskReminderAssignments: (userId: number, period: string) => 
    `${API_BASE_URL}/api/task-reminder/assignments?userId=${userId}&period=${period}`,
  
  // Dashboard Charts
  topDepartments: `${API_BASE_URL}/api/dashboard/top-departments`,
  topRequesters: `${API_BASE_URL}/api/dashboard/top-requesters`,
  topHandlers: `${API_BASE_URL}/api/dashboard/top-handlers`,
  completionHistory: `${API_BASE_URL}/api/dashboard/completion-history`,
  trendHistory: `${API_BASE_URL}/api/dashboard/trend-history`,
  dashboardDetailedAnalysis: `${API_BASE_URL}/api/dashboard/ai-detailed-analysis`,
  
  // Chat
  login: `${API_BASE_URL}/api/chat/login`,
  message: `${API_BASE_URL}/api/chat/message`,
  createSession: `${API_BASE_URL}/api/chat/session/get-or-create`,
  endSession: (sessionId: number) => `${API_BASE_URL}/api/chat/session/${sessionId}/end`,
  getMessages: (sessionId: number) => `${API_BASE_URL}/api/chat/session/${sessionId}/messages/latest`,
  feedback: (messageId: number) => `${API_BASE_URL}/api/chat/message/${messageId}/feedback`,
}

// Environment info
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
