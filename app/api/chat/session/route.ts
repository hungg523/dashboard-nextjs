import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body
    
    // Validation
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User ID không được để trống', 
          data: null, 
          errors: 'User ID is required', 
          statusCode: 400 
        },
        { status: 400 }
      )
    }
    
    console.log('Getting or creating session for user:', userId)
    
    const response = await fetch('http://192.168.10.135:8001/api/Chat/session/get-or-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: userId.toString() })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Session API response:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error getting/creating session:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Không thể tạo/lấy session', 
        data: null, 
        errors: error instanceof Error ? error.message : 'Unknown error', 
        statusCode: 500 
      },
      { status: 500 }
    )
  }
}
