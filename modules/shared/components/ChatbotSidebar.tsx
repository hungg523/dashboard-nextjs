/**
 * Component Chatbot Sidebar
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, MessageCircle, Sparkles } from 'lucide-react'
import { API_ENDPOINTS } from '@/config/api.config'

interface ChatbotSidebarProps {
  isOpen: boolean
  onClose: () => void
  userId?: number
}

export function ChatbotSidebar({ isOpen, onClose, userId }: ChatbotSidebarProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || !userId) return

    const userMessage = {
      id: Date.now(),
      content: message,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(API_ENDPOINTS.message, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: message,
          sessionId: localStorage.getItem('currentSessionId')
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setMessages(prev => [...prev, {
            id: data.data.id,
            content: data.data.message,
            isUser: false,
            timestamp: new Date()
          }])
        }
      }
    } catch (error) {
      console.error('[Chatbot] Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="h-14 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between px-4 border-b border-blue-700">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">Trợ lý MLG</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="text-white hover:bg-white/20 px-2 py-1 rounded text-xs transition-colors"
          >
            Tạo cuộc trò chuyện mới
          </button>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-8rem)]">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">Bắt đầu cuộc trò chuyện với Trợ lý AI</p>
            <p className="text-xs mt-1">Hỏi về phân tích dữ liệu, xu hướng, hoặc gợi ý cải thiện</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-slate-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="h-16 border-t border-gray-200 px-4 flex items-center gap-2 bg-white">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
