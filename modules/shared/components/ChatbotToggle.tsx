/**
 * Component nút toggle chatbot
 */

'use client'

import { Bot } from 'lucide-react'

interface ChatbotToggleProps {
  onClick: () => void
}

export function ChatbotToggle({ onClick }: ChatbotToggleProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all duration-200 flex items-center justify-center z-40"
      title="Mở trợ lý AI"
    >
      <Bot className="w-7 h-7" />
    </button>
  )
}
