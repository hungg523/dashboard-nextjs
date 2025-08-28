import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tuNgay = searchParams.get('tuNgay') || '2025-01-01'
    const denNgay = searchParams.get('denNgay') || '2025-08-25'
    
    console.log(`Fetching statistics from ${tuNgay} to ${denNgay}`)
    
    const apiUrl = `http://192.168.10.31:8001/api/Chat/statistics?tuNgay=${tuNgay}&denNgay=${denNgay}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout and other options
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      console.error(`API response error: ${response.status} ${response.statusText}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('API response received successfully')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    
    // Check if it's a network/timeout error
    if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        console.log('API timeout, returning mock data')
      } else if (error.message.includes('fetch')) {
        console.log('Network error, returning mock data')
      }
    }
    
    // Return mock data if API fails
    const mockData = {
      success: true,
      message: "Đang sử dụng dữ liệu mẫu do không thể kết nối API",
      data: {
        tongSoPhieu: 25,
        soPhieuMoi: 5,
        soPhieuDangXuLy: 10,
        soPhieuHoanThanh: 10,
        phanTramHoanThanh: 40,
        thongKeTheoLoai: {
          "Yêu cầu thiết bị": 10,
          "Sửa chữa": 8,
          "Cài đặt phần mềm": 4,
          "Phân quyền": 3
        },
        thongKeTheoBoPhan: {
          "IT": 8,
          "Kế toán": 6,
          "Nhân sự": 5,
          "Kinh doanh": 6
        }
      },
      errors: null,
      statusCode: 200
    }
    
    return NextResponse.json(mockData)
  }
}
