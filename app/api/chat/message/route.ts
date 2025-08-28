// Disable SSL verification for localhost development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

// Create HTTPS agent that ignores SSL certificate errors
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body
    
    const requestData = {
      message: message,
      idNhanVien: 395,
      moduleName: "it"
    }
    
    console.log('Sending message to chat API:', requestData)
    
    // Use fetch with custom agent for HTTPS
    const response = await fetch('https://localhost:7040/api/Chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      // @ts-ignore - Custom agent for Node.js
      agent: httpsAgent
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Chat API response:', data)
    
    // Force sessionId to be "2"
    if (data.success && data.data) {
      data.data.sessionId = "2"
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Không thể kết nối đến server chat', 
        data: null, 
        errors: error instanceof Error ? error.message : 'Unknown error', 
        statusCode: 500 
      },
      { status: 500 }
    )
  }
}
