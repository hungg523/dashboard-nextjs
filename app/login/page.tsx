"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import dynamic from "next/dynamic"

// Disable SSR for this component to avoid hydration mismatch
export default dynamic(() => Promise.resolve(LoginPageContent), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center">Đang tải...</div>
})

function LoginPageContent() {
  const router = useRouter()
  const { login } = useAuth()
  const [employeeCode, setEmployeeCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Initialize lucide icons after mount
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).lucide) {
        (window as any).lucide.createIcons()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!employeeCode.trim()) {
      setError("Vui lòng nhập mã nhân viên")
      return
    }

    setIsLoading(true)

    try {
      const user = await login(employeeCode)
      
      if (user) {
        router.push("/dashboard")
      } else {
        setError("Mã nhân viên không tồn tại")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return <div className="w-full h-screen flex items-center justify-center">Đang tải...</div>
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <script src="https://unpkg.com/lucide@latest" async></script>
      
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i data-lucide="bot" className="w-10 h-10 text-white"></i>
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
                placeholder="Nhập mã nhân viên..."
                required
                autoComplete="off"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
    </>
  )
}
