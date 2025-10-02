import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { generateSessionId } from '@/lib/utils'
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

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { tagUid, type, latitude, longitude } = await request.json()

    if (!tagUid || !type) {
      return NextResponse.json(
        { error: 'Tag UID and type are required' },
        { status: 400 }
      )
    }

    if (!['IN', 'OUT'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "IN" or "OUT"' },
        { status: 400 }
      )
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user || user.status !== 'active') {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 404 }
      )
    }

    // Check for existing session if checking IN
    if (type === 'IN') {
      const existingSession = await prisma.attendance.findFirst({
        where: {
          userId: payload.userId,
          type: 'IN',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Check if there's a corresponding OUT for the latest IN
      if (existingSession) {
        const correspondingOut = await prisma.attendance.findFirst({
          where: {
            userId: payload.userId,
            type: 'OUT',
            createdAt: {
              gt: existingSession.createdAt
            }
          }
        })

        if (!correspondingOut) {
          return NextResponse.json(
            { error: 'You are already checked in. Please check out first.' },
            { status: 400 }
          )
        }
      }
    }

    // Generate session ID for IN, or find matching session for OUT
    let sessionId = generateSessionId()
    if (type === 'OUT') {
      const latestIn = await prisma.attendance.findFirst({
        where: {
          userId: payload.userId,
          type: 'IN'
        },
        orderBy: { createdAt: 'desc' }
      })

      if (latestIn) {
        sessionId = latestIn.sessionId || sessionId
      }
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: payload.userId,
        sessionId,
        type,
        method: tagUid.startsWith('nfc_') ? 'NFC' : 'RFID',
        token: tagUid,
        latitude,
        longitude
      }
    })

    // Send push notification if device token exists
    if (user.deviceToken) {
      try {
        await sendPushNotification(
          user.deviceToken,
          `Check ${type.toLowerCase()} successful`,
          `You have successfully checked ${type.toLowerCase()} at ${new Date().toLocaleTimeString()}`,
          {
            type: 'attendance',
            attendanceType: type,
            timestamp: new Date().toISOString()
          }
        )
      } catch (notificationError) {
        console.error('Push notification error:', notificationError)
        // Don't fail the attendance if notification fails
      }
    }

    return NextResponse.json({
      message: `Successfully checked ${type.toLowerCase()}`,
      attendance: {
        id: attendance.id,
        type: attendance.type,
        method: attendance.method,
        createdAt: attendance.createdAt,
        sessionId: attendance.sessionId
      }
    })

  } catch (error) {
    console.error('NFC attendance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
