/**
 * Các hàm tiện ích cho việc format dữ liệu
 */

/**
 * Lấy chữ cái đầu từ tên người dùng
 */
export function getInitials(name: string): string {
  if (!name) return '??'
  
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Format ngày tháng sang định dạng ngắn gọn
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return dateString
  }
}

/**
 * Format ngày giờ đầy đủ
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return dateString
  }
}

/**
 * Escape HTML để tránh XSS
 */
export function escapeHtml(text: string): string {
  if (!text) return ''
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Lấy màu ngẫu nhiên cho avatar
 */
const avatarColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-red-500'
]

export function getRandomColor(): string {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)]
}

/**
 * Lấy class CSS cho mức độ ưu tiên
 */
export function getPriorityClass(priority?: string): string {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-700 border border-red-200'
    case 'medium':
      return 'bg-orange-100 text-orange-700 border border-orange-200'
    case 'low':
      return 'bg-green-100 text-green-700 border border-green-200'
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
}

/**
 * Lấy class CSS cho trạng thái
 */
export function getStatusClass(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'new':
    case 'mới':
      return 'bg-blue-100 text-blue-700 border border-blue-200'
    case 'inprogress':
    case 'đang xử lý':
      return 'bg-orange-100 text-orange-700 border border-orange-200'
    case 'completed':
    case 'hoàn thành':
      return 'bg-green-100 text-green-700 border border-green-200'
    case 'overdue':
    case 'quá hạn':
      return 'bg-red-100 text-red-700 border border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
}

/**
 * Truncate text với số ký tự tối đa
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Format số với dấu phân cách hàng nghìn
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
