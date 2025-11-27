"use client"

import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Send, Bot, User, RefreshCw, MessageCircle, Minimize2, Maximize2, X, Settings, ChevronDown, MoreHorizontal, ThumbsUp, ThumbsDown, Star, Loader2 } from 'lucide-react'
import { ChatMessage, ChatResponse, ApiResponse, MessagesResponse, ChatSession } from '@/types/chat'
import { chatService, SuggestionResponse, PaginatedMessagesResponse } from '@/services'
import SessionModal from './SessionModal'

interface ChatBotProps {
  sessionId?: string
  className?: string
}

export interface ChatBotRef {
  sendQuickMessage: (message: string) => void
}

const ChatBot = forwardRef<ChatBotRef, ChatBotProps>(({ sessionId: initialSessionId, className = "" }, ref) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>(initialSessionId || "")
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null)
  const [feedbackRating, setFeedbackRating] = useState<number>(5)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Infinite scroll states
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [nextBeforeMessageId, setNextBeforeMessageId] = useState<number | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesTopRef = useRef<HTMLDivElement>(null)

  // Danh sách câu hỏi phổ biến
  const popularQuestions = [
    "Làm thế nào để tạo phiếu yêu cầu?",
    "Tôi không thể truy cập vào hệ thống được",
    "Có tổng cộng bao nhiêu phiếu phân quyền?",
    "Ông Trần Văn Sửu có bao nhiêu yêu cầu?",
    "Tạo cho tôi phiếu yêu cầu cấp quyền",
    "Tôi cần quyền truy cập vào Phiếu xuất hàng"
  ]

  const scrollToBottom = (forceInstant = false) => {
    try {
      if (messagesEndRef.current) {
        const behavior = forceInstant ? 'instant' : 'smooth'
        messagesEndRef.current.scrollIntoView({ behavior: behavior as ScrollBehavior })
        console.log('Scrolled to bottom with behavior:', behavior)
      } else {
        console.warn('messagesEndRef is not available')
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error)
    }
  }

  // Theo dõi scroll để hiển thị nút scroll to bottom
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const { scrollTop, scrollHeight, clientHeight } = element
    
    // Hiển thị nút khi không ở cuối (còn cách cuối > 100px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollToBottom(!isNearBottom && messages.length > 0)
  }

  // Effect để theo dõi scroll trong ScrollArea
  // Scroll event handler với infinite scroll support
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement
    
    if (scrollElement) {
      const handleScrollEvent = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollElement
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        const isNearTop = scrollTop < 50
        
        // Show scroll to bottom button
        setShowScrollToBottom(!isNearBottom && messages.length > 0)
        
        // Load more messages when scrolled near top
        if (isNearTop && hasMoreMessages && !isLoadingMore && !isLoading) {
          console.log('Near top, loading more messages...')
          loadMoreMessages()
        }
      }
      
      scrollElement.addEventListener('scroll', handleScrollEvent)
      return () => scrollElement.removeEventListener('scroll', handleScrollEvent)
    }
  }, [messages.length, hasMoreMessages, isLoadingMore, isLoading])

  // Auto scroll to bottom chỉ khi typing status changes (không scroll khi có messages mới)
  useEffect(() => {
    if (isTyping) {
      // Delay scroll để đảm bảo DOM đã render xong
      const timeoutId = setTimeout(() => {
        scrollToBottom()
      }, 200)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isTyping])

  // Load messages when session changes
  useEffect(() => {
    if (currentSession) {
      console.log('Loading messages for session:', currentSession.id)
      loadLatestMessages().then(() => {
        // Scroll to bottom sau khi load messages xong
        setTimeout(() => {
          console.log('Force scrolling to bottom after session change')
          scrollToBottom(true)
        }, 500)
      })
    }
  }, [currentSession])

  // Hàm mở modal feedback
  const openFeedbackModal = (messageId: number) => {
    setSelectedMessageId(messageId)
    setFeedbackRating(5)
    setFeedbackComment('')
    setShowFeedbackModal(true)
  }

  // Hàm gửi feedback
  const sendFeedback = async () => {
    if (!selectedMessageId) return

    try {
      setIsLoading(true)
      const result = await chatService.sendFeedback(selectedMessageId, feedbackRating, feedbackComment)
      
      if (result) {
        setShowFeedbackModal(false)
        setSelectedMessageId(null)
        setFeedbackComment('')
        setFeedbackRating(5)
        // Có thể thêm toast notification ở đây
        console.log('Feedback đã được gửi thành công')
      }
    } catch (error) {
      console.error('Lỗi khi gửi feedback:', error)
      setError('Không thể gửi feedback. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm lấy suggestions từ API
  const fetchSuggestions = async () => {
    console.log('fetchSuggestions called')
    try {
      const data = await chatService.getSuggestions()
      console.log('Suggestions received:', data)
      setSuggestions(data)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Lỗi khi lấy suggestions:', error)
      // Không hiển thị error cho suggestions vì nó không quan trọng lắm
      setShowSuggestions(false)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Effect để fetch suggestions khi có tin nhắn mới từ bot
  useEffect(() => {
    if (messages.length > 1) { // Cần ít nhất 2 tin nhắn (user + bot)
      const lastMessage = messages[messages.length - 1]
      const previousMessage = messages[messages.length - 2]
      
      // Chỉ fetch khi tin nhắn cuối từ bot, trước đó từ user, và không có lỗi
      if (lastMessage.senderRole === 'bot' && 
          !lastMessage.isError && 
          !isTyping && 
          previousMessage.senderRole === 'user') {
        console.log('Fetching suggestions for new bot message')
        fetchSuggestions()
      }
    }
  }, [messages.length, isTyping]) // Chỉ depend vào length thay vì toàn bộ messages

  useEffect(() => {
    if (sessionId && currentSession?.messages) {
      // Đảm bảo messages là array
      const messagesArray = Array.isArray(currentSession.messages) ? currentSession.messages : []
      setMessages(messagesArray)
    }
  }, [sessionId, currentSession])

  // Load tin nhắn mới nhất (initial load)
  const loadLatestMessages = async () => {
    if (!currentSession) return

    try {
      setIsLoading(true)
      setError(null)
      
      const result = await chatService.getLatestMessages(currentSession.id)
      console.log('Latest messages result:', result)
      
      // Sử dụng tin nhắn theo thứ tự API trả về (mới nhất ở cuối)
      setMessages(result.messages)
      setHasMoreMessages(result.hasMore)
      setNextBeforeMessageId(result.nextBeforeMessageId)
      
      console.log(`Đã load ${result.messages.length} tin nhắn mới nhất`)
      console.log('Has more messages:', result.hasMore)
      console.log('Next before ID:', result.nextBeforeMessageId)
      
      // Scroll to bottom sau khi load xong - tăng timeout để đảm bảo DOM render
      setTimeout(() => scrollToBottom(true), 300)
      
    } catch (err) {
      console.error('Error loading latest messages:', err)
      const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải tin nhắn'
      setError(errorMsg)
      setMessages([])
      setHasMoreMessages(false)
      setNextBeforeMessageId(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Load thêm tin nhắn cũ hơn (infinite scroll)
  const loadMoreMessages = async () => {
    if (!currentSession || !hasMoreMessages || !nextBeforeMessageId || isLoadingMore) return

    try {
      setIsLoadingMore(true)
      
      // Lưu scroll position để anchor
      const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
      const scrollHeightBefore = scrollArea?.scrollHeight || 0
      const scrollTopBefore = scrollArea?.scrollTop || 0
      
      const result = await chatService.getMessagesBefore(currentSession.id, nextBeforeMessageId)
      console.log('Load more messages result:', result)
      
      // Thêm tin nhắn cũ vào đầu danh sách (API đã trả về đúng thứ tự)
      setMessages(prev => [...result.messages, ...prev])
      setHasMoreMessages(result.hasMore)
      setNextBeforeMessageId(result.nextBeforeMessageId)
      
      console.log(`Đã load thêm ${result.messages.length} tin nhắn`)
      
      // Scroll anchoring: giữ vị trí tương đối
      setTimeout(() => {
        if (scrollArea) {
          const scrollHeightAfter = scrollArea.scrollHeight
          const heightDifference = scrollHeightAfter - scrollHeightBefore
          scrollArea.scrollTop = scrollTopBefore + heightDifference
        }
      }, 50)
      
    } catch (err) {
      console.error('Error loading more messages:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Legacy reload messages (để tương thích ngược)
  const reloadMessages = async () => {
    await loadLatestMessages()
  }

  // Xử lý khi session được tạo từ modal
  const handleSessionCreated = (session: ChatSession) => {
    setCurrentSession(session)
    setSessionId(session.id.toString())
    setError(null)
    
    // Load messages nếu có, đảm bảo luôn là array
    if (session.messages && Array.isArray(session.messages) && session.messages.length > 0) {
      setMessages(session.messages)
      // Hiển thị thông báo đã load messages
      console.log(`Đã load ${session.messages.length} tin nhắn từ session cũ`)
    } else {
      setMessages([])
    }
    
    // Focus vào input sau khi tạo session thành công
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  // Hàm gửi tin nhắn chính
  const sendMessage = async () => {
    if (!currentMessage.trim()) return
    
    if (!currentSession) {
      setError('Vui lòng tạo session trước khi gửi tin nhắn')
      setShowSessionModal(true)
      return
    }

    // Ẩn suggestions khi user gửi tin nhắn mới
    console.log('Hiding suggestions before sending message')
    setShowSuggestions(false)

    const userMessage = currentMessage
    setCurrentMessage('')
    setIsTyping(true)
    setError(null)

    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      sessionId: parseInt(sessionId) || 0,
      senderRole: 'user',
      messageText: userMessage,
      isError: false,
      source: 'web',
      session: null,
      intents: [],
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
      startedDate: null,
      endedDate: null
    }

    setMessages(prev => [...prev, tempUserMessage])

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          idNhanVien: parseInt(currentSession.userId),
          moduleName: currentSession.moduleCode
        })
      })

      const result: ApiResponse<ChatResponse> = await response.json()

      if (result.success && result.data) {
        // Add bot response
        const botMessage: ChatMessage = {
          sessionId: parseInt(result.data.sessionId) || 0,
          senderRole: 'bot',
          messageText: result.data.response,
          isError: false,
          source: 'ai',
          session: null,
          intents: [],
          id: Date.now() + 1,
          createdAt: result.data.timestamp,
          updatedAt: null,
          deletedAt: null,
          startedDate: null,
          endedDate: null
        }

        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(result.message || 'Không thể gửi tin nhắn')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi tin nhắn'
      setError(errorMsg)
      
      // Add error message
      const errorMessage: ChatMessage = {
        sessionId: parseInt(sessionId) || 0,
        senderRole: 'bot',
        messageText: `Lỗi: ${errorMsg}`,
        isError: true,
        source: 'system',
        session: null,
        intents: [],
        id: Date.now() + 1,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        deletedAt: null,
        startedDate: null,
        endedDate: null
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      // Scroll to bottom sau khi hoàn thành gửi tin nhắn (bao gồm cả bot response)
      setTimeout(() => scrollToBottom(), 100)
    }
  }

  const sendQuickMessage = (message: string) => {
    setCurrentMessage(message)
    setTimeout(() => {
      sendMessage()
    }, 100)
  }

  useImperativeHandle(ref, () => ({
    sendQuickMessage
  }))

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startNewChat = () => {
    setMessages([])
    setSessionId('')
    setCurrentSession(null)
    setError(null)
    setShowSessionModal(true)
    inputRef.current?.focus()
  }

  // Hàm gửi câu hỏi gợi ý
  const sendSuggestedQuestion = async (question: string) => {
    if (!currentSession) return
    
    // Ẩn suggestions khi user chọn suggested question
    setShowSuggestions(false)
    
    setCurrentMessage(question)
    inputRef.current?.focus()
    
    // Gửi tin nhắn trực tiếp
    const userMessage = question
    setCurrentMessage('')
    setIsTyping(true)
    setError(null)

    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      sessionId: parseInt(sessionId) || 0,
      senderRole: 'user',
      messageText: userMessage,
      isError: false,
      source: 'web',
      session: null,
      intents: [],
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
      startedDate: null,
      endedDate: null
    }

    setMessages(prev => [...prev, tempUserMessage])

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          idNhanVien: parseInt(currentSession.userId),
          moduleName: currentSession.moduleCode
        })
      })

      const result: ApiResponse<ChatResponse> = await response.json()

      if (result.success && result.data) {
        // Add bot response
        const botMessage: ChatMessage = {
          sessionId: parseInt(result.data.sessionId) || 0,
          senderRole: 'bot',
          messageText: result.data.response,
          isError: false,
          source: 'ai',
          session: null,
          intents: [],
          id: Date.now() + 1,
          createdAt: result.data.timestamp,
          updatedAt: null,
          deletedAt: null,
          startedDate: null,
          endedDate: null
        }

        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(result.message || 'Không thể gửi tin nhắn')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi tin nhắn'
      setError(errorMsg)
    } finally {
      setIsTyping(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'h-16' : 'h-[500px] md:h-[600px] lg:h-[700px]'} ${className}`}>
      <CardHeader className="flex-shrink-0 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="h-5 w-5 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="font-semibold">IT Support Chatbot</span>
            {sessionId && currentSession && !isCollapsed && (
              <Badge variant="outline" className="text-xs">
                Session: {sessionId}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowSessionModal(true)
                  }}
                  className="flex items-center gap-1 h-8"
                >
                  <Settings className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    reloadMessages()
                  }}
                  disabled={!currentSession || isLoading}
                  className="flex items-center gap-1 h-8"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    startNewChat()
                  }}
                  className="flex items-center gap-1 h-8"
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsCollapsed(!isCollapsed)
              }}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
        {isCollapsed && sessionId && currentSession && (
          <div className="text-xs text-gray-500 mt-1">
            Nhấn để mở rộng chat • Session: {sessionId} • User: {currentSession.userId}
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="flex flex-col flex-1 p-4 min-h-0">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <p className="text-red-600 text-sm">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          <ScrollArea 
            className="flex-1 mb-1 max-h-[250px] md:max-h-[320px] lg:max-h-[400px] scrollbar-thin relative"
            ref={scrollAreaRef}
          >
            <div className="space-y-4 pr-3">
              {/* Load more indicator at top */}
              <div ref={messagesTopRef}></div>
              {isLoadingMore && (
                <div className="flex justify-center items-center py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải thêm tin nhắn...
                  </div>
                </div>
              )}
              
              {(!Array.isArray(messages) || messages.length === 0) && !isLoading && !currentSession && (
                <div className="text-center text-gray-500 py-12">
                  <div className="relative mx-auto w-16 h-16 mb-6">
                    <Bot className="h-16 w-16 text-gray-300" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xl font-semibold mb-2">Chào mừng đến với IT Support</p>
                  <p className="text-sm text-gray-400 mb-4">Vui lòng tạo session để bắt đầu chat</p>
                  
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 max-w-sm mx-auto">
                      <p className="text-sm text-yellow-700 mb-2">
                        Bạn cần tạo session chat trước khi sử dụng
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSessionModal(true)}
                        className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Tạo Session
                      </Button>
                    </div>                  <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto text-xs">
                  </div>
                </div>
              )}

              {(!Array.isArray(messages) || messages.length === 0) && !isLoading && currentSession && (
                <div className="text-center text-gray-500 py-8">
                  <div className="relative mx-auto w-12 h-12 mb-4">
                    <Bot className="h-12 w-12 text-green-500" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-lg font-semibold mb-2 text-green-700">Session đã sẵn sàng!</p>
                  <p className="text-sm text-gray-400 mb-6">Hãy chọn một câu hỏi phổ biến hoặc gửi tin nhắn của bạn</p>
                  
                  {/* Câu hỏi phổ biến */}
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-sm font-medium text-gray-600 mb-4">Câu hỏi phổ biến:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {popularQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => sendSuggestedQuestion(question)}
                          className="text-left p-3 text-xs bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                        >
                          <div className="flex items-start gap-2">
                            <MessageCircle className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 group-hover:text-blue-700">
                              {question}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {Array.isArray(messages) && messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-in slide-in-from-bottom-2 ${
                    message.senderRole === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.senderRole === 'bot' && (
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`group max-w-[85%] md:max-w-[75%] min-w-0 ${message.senderRole === 'user' ? 'ml-4 md:ml-8' : 'mr-4 md:mr-8'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm break-words overflow-hidden ${
                        message.senderRole === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-md'
                          : message.isError
                          ? 'bg-red-50 text-red-600 border border-red-200 rounded-tl-md'
                          : 'bg-gray-100 text-gray-900 rounded-tl-md border border-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed break-words overflow-wrap-anywhere">
                        {message.messageText}
                      </div>
                      
                      {/* Nút feedback cho tin nhắn từ bot */}
                      {message.senderRole === 'bot' && (
                        <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openFeedbackModal(message.id)}>
                                <MessageCircle className="h-3 w-3 mr-2" />
                                Gửi feedback
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        message.senderRole === 'user'
                          ? 'text-right text-gray-500'
                          : 'text-left text-gray-400'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>

                  {message.senderRole === 'user' && (
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-green-100 text-green-600">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start animate-in slide-in-from-bottom-2">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">Đang trả lời...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
            
            {/* Nút scroll to bottom */}
            {showScrollToBottom && (
              <Button
                onClick={() => scrollToBottom()}
                size="sm"
                className="absolute bottom-2 right-2 z-10 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg border-2 border-white"
                variant="default"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </ScrollArea>

          {/* Câu hỏi nhanh - chỉ hiển thị khi có suggestions và không đang typing */}
          {showSuggestions && suggestions && suggestions.quickQuestions && suggestions.quickQuestions.length > 0 && !isTyping && currentSession && (
            <div className="mb-3 mx-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg shadow-sm relative z-10">
              <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                {suggestions.quickQuestions.map((question: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => sendSuggestedQuestion(question)}
                    className="px-3 py-2 text-xs bg-white border border-blue-300 text-blue-700 rounded-full hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 whitespace-nowrap flex-shrink-0 shadow-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative min-w-0">
                <Input
                  ref={inputRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={isTyping}
                  className="pr-12 md:pr-16 min-h-[40px] md:min-h-[44px] rounded-xl border-2 focus:border-blue-500 transition-colors resize-none text-sm md:text-base"
                  maxLength={500}
                />
                <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  {currentMessage.length}/500
                </div>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isTyping || currentMessage.length > 500 || !currentSession}
                size="icon"
                className="h-[40px] w-[40px] md:h-[44px] md:w-[44px] flex-shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span className="truncate text-xs md:text-sm">Nhấn Enter để gửi, Shift+Enter để xuống dòng</span>
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 ml-2">
                {currentSession && (
                  <span className="text-blue-600 flex items-center gap-1 text-xs">
                    <User className="w-3 h-3" />
                    <span className="hidden sm:inline">ID:</span> {currentSession.userId}
                  </span>
                )}
                {sessionId && currentSession && (
                  <span className="text-green-600 flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="hidden sm:inline">Session:</span> {sessionId}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
      
      <SessionModal
        open={showSessionModal}
        onOpenChange={setShowSessionModal}
        onSessionCreated={handleSessionCreated}
      />

      {/* Modal Feedback */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gửi Feedback</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Đánh giá chất lượng phản hồi</label>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className={`p-1 rounded-full transition-colors hover:bg-gray-100 ${
                      star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <Star 
                      className="h-8 w-8" 
                      fill={star <= feedbackRating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
              <div className="text-center mt-2 text-sm text-gray-500">
                {feedbackRating === 1 && 'Rất không hài lòng'}
                {feedbackRating === 2 && 'Không hài lòng'}
                {feedbackRating === 3 && 'Bình thường'}
                {feedbackRating === 4 && 'Hài lòng'}
                {feedbackRating === 5 && 'Rất hài lòng'}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Nhận xét (tuỳ chọn)</label>
              <Textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Chia sẻ ý kiến của bạn..."
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {feedbackComment.length}/500
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFeedbackModal(false)}
              disabled={isLoading}
            >
              Huỷ
            </Button>
            <Button
              onClick={sendFeedback}
              disabled={isLoading}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
})

ChatBot.displayName = 'ChatBot'

export default ChatBot
