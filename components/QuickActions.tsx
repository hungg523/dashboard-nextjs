"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  HelpCircle, 
  Settings, 
  Shield, 
  Monitor, 
  Wifi, 
  Printer,
  Lock,
  Mail
} from "lucide-react"

interface QuickActionsProps {
  onQuestionClick: (question: string) => void
}

const quickQuestions = [
  {
    question: "Làm sao để tạo yêu cầu phân quyền?",
    category: "Phân quyền",
    icon: Shield,
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    question: "Tôi quên mật khẩu, làm sao reset?",
    category: "Bảo mật",
    icon: Lock,
    color: "bg-red-50 text-red-700 border-red-200"
  },
  {
    question: "Kiểm tra trạng thái yêu cầu IT của tôi",
    category: "Theo dõi",
    icon: Monitor,
    color: "bg-green-50 text-green-700 border-green-200"
  },
  {
    question: "Hướng dẫn cài đặt phần mềm",
    category: "Phần mềm",
    icon: Settings,
    color: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    question: "Sự cố kết nối mạng",
    category: "Mạng",
    icon: Wifi,
    color: "bg-orange-50 text-orange-700 border-orange-200"
  },
  {
    question: "Máy in không hoạt động",
    category: "Thiết bị",
    icon: Printer,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  {
    question: "Cấu hình email công ty",
    category: "Email",
    icon: Mail,
    color: "bg-teal-50 text-teal-700 border-teal-200"
  },
  {
    question: "Hỗ trợ khác",
    category: "Khác",
    icon: HelpCircle,
    color: "bg-gray-50 text-gray-700 border-gray-200"
  }
]

export default function QuickActions({ onQuestionClick }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          Câu hỏi thường gặp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          {quickQuestions.map((item, index) => {
            const Icon = item.icon
            return (
              <Button
                key={index}
                variant="outline"
                className={`justify-start text-left h-auto p-3 hover:shadow-sm transition-all border-2 ${item.color} min-h-[60px]`}
                onClick={() => onQuestionClick(item.question)}
              >
                <div className="flex items-start gap-3 w-full min-w-0">
                  <Icon className="h-4 w-4 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="font-medium text-xs leading-relaxed break-words hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {item.question}
                    </p>
                    <Badge variant="secondary" className="mt-1.5 text-xs flex-shrink-0 w-fit">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
