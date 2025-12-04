'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/modules/authentication/components/LoginForm'
import { useAuth } from '@/modules/shared/hooks/useAuth'
import dynamic from 'next/dynamic'

export default dynamic(() => Promise.resolve(LoginPageContent), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center bg-gray-50">Đang tải...</div>
})

function LoginPageContent() {
  const router = useRouter()
  const { isAuthenticated, isITMember, login } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      if (isITMember) {
        router.push('/overview')
      } else {
        router.push('/reminders')
      }
    }
  }, [isAuthenticated, isITMember, router])

  const handleLogin = async (employeeCode: string) => {
    const result = await login(employeeCode)
    
    if (result.success && result.user) {
      const department = result.user.tenBoPhan || result.user.boPhan || ''
      const isIT = department.toLowerCase().includes('it')
      
      if (isIT) {
        router.push('/overview')
      } else {
        router.push('/reminders')
      }
    }
    
    return result
  }

  return <LoginForm onLogin={handleLogin} />
}
