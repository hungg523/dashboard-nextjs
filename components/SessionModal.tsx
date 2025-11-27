"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, User, Bot } from 'lucide-react'
import { chatService } from '@/services'
import { ChatSession } from '@/types/chat'

interface SessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSessionCreated: (session: ChatSession) => void
}

export default function SessionModal({ open, onOpenChange, onSessionCreated }: SessionModalProps) {
  const [employeeId, setEmployeeId] = useState('')
  const [moduleName, setModuleName] = useState('IT')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateSession = async () => {
    if (!employeeId.trim()) {
      setError('Vui lòng nhập ID nhân viên')
      return
    }

    try {
      setIsCreating(true)
      setError(null)
      
      const session = await chatService.getOrCreateSession(employeeId)
      
      // Nếu session đã có messages, load chúng lên
      if (session.messages && session.messages.length > 0) {
        // Session từ API đã có messages, sử dụng luôn
        onSessionCreated(session)
      } else {
        // Nếu session không có messages trong response, thử load từ API messages
        try {
          const messages = await chatService.getMessagesBySession(session.id)
          const sessionWithMessages = {
            ...session,
            messages: messages
          }
          onSessionCreated(sessionWithMessages)
        } catch (err) {
          // Nếu không load được messages, vẫn tạo session với messages rỗng
          console.warn('Could not load messages for session:', err)
          onSessionCreated(session)
        }
      }
      
      onOpenChange(false)
      
      // Reset form
      setEmployeeId('')
      setModuleName('IT')
      
    } catch (err) {
      console.error('Error creating session:', err)
      const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo session'
      setError(errorMsg)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      onOpenChange(false)
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="relative">
              <Bot className="h-8 w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <DialogTitle className="text-xl font-bold">Bắt đầu Chat Session</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Vui lòng nhập thông tin để tạo session chat với IT Support Bot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="employeeId" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              ID Nhân viên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="employeeId"
              type="number"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Nhập ID nhân viên của bạn"
              disabled={isCreating}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="module" className="text-sm font-medium">
              Module/Bộ phận
            </Label>
            <Select value={moduleName} onValueChange={setModuleName} disabled={isCreating}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Chọn bộ phận" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IT">IT - Công nghệ thông tin</SelectItem>
                <SelectItem value="HR">HR - Nhân sự</SelectItem>
                <SelectItem value="Accounting">Accounting - Kế toán</SelectItem>
                <SelectItem value="Sales">Sales - Kinh doanh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateSession}
              disabled={!employeeId.trim() || isCreating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo Session'
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            <p>💡 Session sẽ được tạo hoặc tái sử dụng nếu đã tồn tại</p>
            <p>🔒 Thông tin của bạn được bảo mật tuyệt đối</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
