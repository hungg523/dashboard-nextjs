"use client"

import { useState, useRef } from 'react'
import ChatBot, { ChatBotRef } from '@/components/ChatBot'
import QuickActions from '@/components/QuickActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Bot, 
  Zap, 
  Shield, 
  Clock,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react'

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

  const stats = [
    {
      label: "Phản hồi trung bình",
      value: "< 2 giây",
      icon: Clock,
      color: "text-blue-600"
    },
    {
      label: "Độ chính xác",
      value: "94%",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      label: "Người dùng hài lòng",
      value: "98%",
      icon: CheckCircle,
      color: "text-purple-600"
    },
    {
      label: "Hỗ trợ 24/7",
      value: "Luôn sẵn sàng",
      icon: Users,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Bot className="h-12 w-12 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">IT Support Assistant</h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Chatbot thông minh hỗ trợ IT tự động 24/7
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="border-0 shadow-sm bg-white/70 backdrop-blur">
                  <CardContent className="p-4 text-center">
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="xl:col-span-3 space-y-6">
            <ChatBot 
              key={chatKey}
              ref={chatBotRef}
              sessionId="2"
              className="w-full shadow-xl border-0 bg-white/80 backdrop-blur" 
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions onQuestionClick={handleQuestionClick} />
            
            {/* Features Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Tính năng nổi bật
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 mt-0.5 text-blue-200" />
                  <div>
                    <h4 className="font-medium text-sm">AI Thông minh</h4>
                    <p className="text-xs text-blue-100 opacity-90">
                      Hiểu ngữ cảnh và học hỏi từ mỗi cuộc hội thoại
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 mt-0.5 text-yellow-200" />
                  <div>
                    <h4 className="font-medium text-sm">Xử lý nhanh chóng</h4>
                    <p className="text-xs text-blue-100 opacity-90">
                      Phản hồi tức thì cho mọi câu hỏi của bạn
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 mt-0.5 text-green-200" />
                  <div>
                    <h4 className="font-medium text-sm">Bảo mật tuyệt đối</h4>
                    <p className="text-xs text-blue-100 opacity-90">
                      Dữ liệu được mã hóa và bảo vệ hoàn toàn
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Mẹo sử dụng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="font-medium text-blue-800">Mô tả chi tiết vấn đề</p>
                  <p className="text-blue-600 text-xs">Càng chi tiết thì câu trả lời càng chính xác</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <p className="font-medium text-green-800">Sử dụng từ khóa IT</p>
                  <p className="text-green-600 text-xs">VPN, Active Directory, SharePoint...</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <p className="font-medium text-purple-800">Ghi nhớ Session ID</p>
                  <p className="text-purple-600 text-xs">Để tiếp tục cuộc hội thoại sau này</p>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-green-800">Hệ thống hoạt động tốt</p>
                    <p className="text-xs text-green-600">Tất cả dịch vụ IT đang online</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
