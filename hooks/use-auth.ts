"use client"

import { useState, useEffect } from "react"

interface User {
  id: number
  employeeCode: string
  employeeName: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Lấy user từ localStorage hoặc session
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (employeeCode: string) => {
    try {
      const response = await fetch('/api/chat/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeCode })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setUser(data.data)
          localStorage.setItem('currentUser', JSON.stringify(data.data))
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
    window.location.href = '/'
  }

  return { user, login, logout }
}
