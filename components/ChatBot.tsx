"use client"

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, RefreshCw, MessageCircle, Minimize2, Maximize2, X } from 'lucide-react'
import { ChatMessage, ChatResponse, ApiResponse, MessagesResponse } from '@/types/chat'

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
  const [sessionId, setSessionId] = useState<string>(initialSessionId || "2")
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (sessionId) {
      loadMessages()
    }
  }, [sessionId])

  const loadMessages = async () => {
    if (!sessionId) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/chat/session/${sessionId}/messages`)
      const result: ApiResponse<MessagesResponse> = await response.json()

      if (result.success && result.data.messages) {
        setMessages(result.data.messages)
      } else {
        throw new Error(result.message || 'Không thể tải tin nhắn')
      }
    } catch (err) {
      console.error('Error loading messages:', err)
      const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải tin nhắn'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim()) return

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
          message: userMessage
        })
      })

      const result: ApiResponse<ChatResponse> = await response.json()

      if (result.success && result.data) {
        // Update session ID if we got a new one
        if (result.data.sessionId && result.data.sessionId !== sessionId) {
          setSessionId(result.data.sessionId)
        }

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
    setError(null)
    inputRef.current?.focus()
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'h-16' : 'h-[700px]'} ${className}`}>
      <CardHeader className="flex-shrink-0 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="h-5 w-5 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="font-semibold">IT Support Chatbot</span>
            {sessionId && !isCollapsed && (
              <Badge variant="outline" className="text-xs">
                Session: {sessionId.slice(-6)}
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
                    loadMessages()
                  }}
                  disabled={!sessionId || isLoading}
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
        {isCollapsed && sessionId && (
          <div className="text-xs text-gray-500 mt-1">
            Nhấn để mở rộng chat • Session: {sessionId.slice(-6)}
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

          <ScrollArea className="flex-1 mb-4 max-h-[500px] scrollbar-thin">
            <div className="space-y-4 pr-3">
              {messages.length === 0 && !isLoading && (
                <div className="text-center text-gray-500 py-12">
                  <div className="relative mx-auto w-16 h-16 mb-6">
                    <Bot className="h-16 w-16 text-gray-300" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xl font-semibold mb-2">Chào mừng đến với IT Support</p>
                  <p className="text-sm text-gray-400 mb-4">Tôi có thể giúp bạn về các vấn đề IT</p>
                  <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto text-xs">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-700">💡 Tạo yêu cầu IT</div>
                    <div className="p-2 bg-green-50 rounded-lg text-green-700">🔧 Hướng dẫn khắc phục</div>
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-700">🔐 Hỗ trợ phân quyền</div>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
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

                  <div className={`group max-w-[75%] min-w-0 ${message.senderRole === 'user' ? 'ml-8' : 'mr-8'}`}>
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
          </ScrollArea>

          <div className="border-t pt-4 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative min-w-0">
                <Input
                  ref={inputRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={isTyping}
                  className="pr-16 min-h-[44px] rounded-xl border-2 focus:border-blue-500 transition-colors resize-none"
                  maxLength={500}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  {currentMessage.length}/500
                </div>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isTyping || currentMessage.length > 500}
                size="icon"
                className="h-[44px] w-[44px] flex-shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span className="truncate">Nhấn Enter để gửi, Shift+Enter để xuống dòng</span>
              {sessionId && (
                <span className="text-green-600 flex items-center gap-1 flex-shrink-0 ml-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Kết nối
                </span>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
})

ChatBot.displayName = 'ChatBot'

export default ChatBot
