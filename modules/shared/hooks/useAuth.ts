/**
 * Custom hook để quản lý authentication state
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/modules/shared/types/user'
import { AuthService } from '@/modules/authentication/services/auth.service'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = AuthService.getUser()
    setUser(savedUser)
    setIsLoading(false)
  }, [])

  const login = async (employeeCode: string) => {
    try {
      const result = await AuthService.login(employeeCode)
      
      if (result.success && result.data) {
        setUser(result.data)
        return { success: true, user: result.data }
      }
      
      return { 
        success: false, 
        error: result.message || 'Đăng nhập thất bại' 
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Không thể kết nối đến server' 
      }
    }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    router.push('/login')
  }

  const isITMember = () => {
    return AuthService.isITMember(user)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isITMember: isITMember(),
    login,
    logout,
  }
}
