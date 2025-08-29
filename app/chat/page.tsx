"use client"

import ChatBot, { ChatBotRef } from '@/components/ChatBot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bot
} from 'lucide-react'
import { useRef, useState } from 'react'

export default function ChatPage() {
  const [chatKey, setChatKey] = useState(0)
  const chatBotRef = useRef<ChatBotRef>(null)

  const handleQuestionClick = (question: string) => {
    // Force re-render chatbot to send the question
    setChatKey(prev => prev + 1)
    
    // Send message after a small delay to ensure component is mounted
    setTimeout(() => {
      if (chatBotRef.current) {
        chatBotRef.current.sendQuickMessage(question)
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Bot className="h-8 w-8 md:h-12 md:w-12 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">IT Support Assistant</h1>
          </div>
          <p className="text-lg md:text-xl text-gray-600 mb-4 md:mb-6">
            Chatbot thông minh hỗ trợ IT tự động 24/7
          </p>
        </div>

        {/* Main Chat Area - Centered */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <ChatBot 
              key={chatKey}
              ref={chatBotRef}
              className="w-full shadow-xl border-0 bg-white/80 backdrop-blur" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
