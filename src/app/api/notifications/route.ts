import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { sendPushNotification } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { deviceToken, title, body, data } = await request.json()

    if (!deviceToken || !title || !body) {
      return NextResponse.json(
        { error: 'Device token, title, and body are required' },
        { status: 400 }
      )
    }

    // Send push notification
    const response = await sendPushNotification(deviceToken, title, body, data)

    return NextResponse.json({
      message: 'Notification sent successfully',
      messageId: response
    })

  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// Register device token
export async function PUT(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { deviceToken } = await request.json()

    if (!deviceToken) {
      return NextResponse.json(
        { error: 'Device token is required' },
        { status: 400 }
      )
    }

    // Update user's device token in database
    const { prisma } = await import('@/lib/db')
    
    await prisma.user.update({
      where: { id: payload.userId },
      data: { deviceToken }
    })

    return NextResponse.json({
      message: 'Device token registered successfully'
    })

  } catch (error) {
    console.error('Device token registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register device token' },
      { status: 500 }
    )
  }
}
