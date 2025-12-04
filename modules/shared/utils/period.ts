/**
 * Các hàm tiện ích xử lý thời gian và period
 */

import { Period } from '@/modules/it-tickets/types'

/**
 * Lấy nhãn hiển thị cho period
 */
export function getPeriodLabel(period: Period): string {
  switch (period) {
    case 'today':
      return 'Hôm nay'
    case 'this_week':
      return 'Tuần này'
    case 'this_month':
      return 'Tháng này'
    case 'all':
      return '6 tháng qua'
    default:
      return 'Tháng này'
  }
}

/**
 * Lấy mô tả chi tiết cho period
 */
export function getPeriodDescription(period: Period): string {
  const now = new Date()
  
  switch (period) {
    case 'today':
      return now.toLocaleDateString('vi-VN')
    
    case 'this_week': {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return `${weekStart.toLocaleDateString('vi-VN')} - ${weekEnd.toLocaleDateString('vi-VN')}`
    }
    
    case 'this_month':
      return `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`
    
    case 'all':
      return '6 tháng gần nhất'
    
    default:
      return `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`
  }
}

/**
 * Lấy range ngày cho period
 */
export function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    
    case 'this_week':
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    
    case 'this_month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    
    case 'all':
      start.setMonth(now.getMonth() - 6)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
  }
  
  return { start, end }
}
