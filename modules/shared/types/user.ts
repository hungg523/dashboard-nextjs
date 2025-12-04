/**
 * Định nghĩa kiểu dữ liệu cho người dùng
 */
export interface User {
  userId: number
  employeeId: number
  employeeCode: string
  fullName: string
  tenBoPhan?: string
  boPhan?: string
  chucVu?: string
  email?: string
  phone?: string
}

export interface LoginRequest {
  employeeCode: string
}

export interface LoginResponse {
  success: boolean
  data?: User
  message?: string
}
