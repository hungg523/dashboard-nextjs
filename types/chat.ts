export interface ChatMessage {
  sessionId: number
  senderRole: 'user' | 'bot'
  messageText: string
  isError: boolean
  source: string
  session: null
  intents: any[]
  id: number
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  startedDate: string | null
  endedDate: string | null
}

export interface ChatSession {
  userId: string
  moduleCode: string
  startTime: string
  endTime: string | null
  status: 'open' | 'closed'
  intentSummary: string | null
  messages: ChatMessage[]
  id: number
  createdAt: string
}

export interface ChatResponse {
  response: string
  sessionId: string
  timestamp: string
  metadata: {
    Intent: string
    Entities: Record<string, any>
  }
}

export interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T
  errors: string | null
  statusCode: number
}

export interface MessagesResponse {
  messages: ChatMessage[]
  count: number
}

export interface PaginatedMessagesResponse {
  messages: ChatMessage[]
  count: number
  hasMore: boolean
  nextBeforeMessageId: number | null
  paginationInfo: string
}
