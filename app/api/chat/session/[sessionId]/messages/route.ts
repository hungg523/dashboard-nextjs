// Disable SSL verification for localhost development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

// Create HTTPS agent that ignores SSL certificate errors
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = 2
    
    console.log('Fetching messages for session:', sessionId)
    
    const response = await fetch(`https://localhost:7040/api/Chat/session/${sessionId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // @ts-ignore - Custom agent for Node.js
      agent: httpsAgent
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Messages API response:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching messages:', error)
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
