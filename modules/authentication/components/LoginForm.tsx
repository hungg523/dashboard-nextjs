/**
 * Component Login Form
 */

'use client'

import { useState, FormEvent } from 'react'
import { Bot } from 'lucide-react'

interface LoginFormProps {
  onLogin: (employeeCode: string) => Promise<{ success: boolean; error?: string }>
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [employeeCode, setEmployeeCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!employeeCode.trim()) {
      setError('Vui lòng nhập mã nhân viên')
      return
    }

    setIsLoading(true)

    try {
      const result = await onLogin(employeeCode.trim())

      if (!result.success) {
        setError(result.error || 'Đăng nhập thất bại')
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">MLG IT Chatbot</h1>
          <p className="text-slate-500">Đăng nhập bằng mã nhân viên</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="employee-code" className="block text-sm font-medium text-slate-700 mb-2">
              Mã nhân viên
            </label>
            <input
              type="text"
              id="employee-code"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="Nhập mã nhân viên..."
              autoComplete="off"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
