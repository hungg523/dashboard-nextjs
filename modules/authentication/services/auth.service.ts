/**
 * Service xử lý authentication
 */

import { User, LoginRequest, LoginResponse } from '@/modules/shared/types/user'
import { API_ENDPOINTS } from '@/config/api.config'

export class AuthService {
  /**
   * Đăng nhập bằng mã nhân viên
   */
  static async login(employeeCode: string): Promise<LoginResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeCode }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        const userData: User = {
          userId: data.data.employeeId,
          employeeId: data.data.employeeId,
          employeeCode: data.data.employeeCode,
          fullName: data.data.employeeName || data.data.fullName || '',
          tenBoPhan: data.data.tenBoPhan,
          boPhan: data.data.boPhan,
          chucVu: data.data.tenChucVu,
          email: data.data.email,
          phone: data.data.phone
        }
        
        this.saveUser(userData)
        
        return {
          success: true,
          data: userData,
          message: data.message
        }
      }
      
      return data
    } catch (error) {
      console.error('[AuthService] Login error:', error)
      throw error
    }
  }

  /**
   * Lưu thông tin người dùng vào localStorage
   */
  static saveUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
  }

  /**
   * Lấy thông tin người dùng từ localStorage
   */
  static getUser(): User | null {
    if (typeof window === 'undefined') return null
    
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  /**
   * Đăng xuất
   */
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('currentSessionId')
    }
  }

  /**
   * Kiểm tra user có phải là thành viên IT không
   */
  static isITMember(user: User | null): boolean {
    if (!user) return false
    
    const department = user.tenBoPhan || user.boPhan || ''
    return department.toLowerCase().includes('it')
  }
}
