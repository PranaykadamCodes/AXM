import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// Create WFH request (Employee)
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

    const body = await request.json()
    const { date, reason } = body

    // Validate required fields
    if (!date || !reason) {
      return NextResponse.json(
        { error: 'Date and reason are required' },
        { status: 400 }
      )
    }

    const wfhDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if date is in the future or today
    if (wfhDate < today) {
      return NextResponse.json(
        { error: 'WFH date cannot be in the past' },
        { status: 400 }
      )
    }

        // Check if user already has a WFH request for this date
        const existingRequest = await prisma.wFHRequest.findFirst({
      where: {
        userId: payload.userId,
        date: {
          gte: new Date(wfhDate.setHours(0, 0, 0, 0)),
          lt: new Date(wfhDate.setHours(23, 59, 59, 999))
        }
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a WFH request for this date' },
        { status: 409 }
      )
    }

        // Create WFH request
        const wfhRequest = await prisma.wFHRequest.create({
      data: {
        userId: payload.userId,
        date: new Date(date),
        reason,
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'WFH request submitted successfully',
      wfhRequest
    })

  } catch (error) {
    console.error('WFH request creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get WFH requests
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const whereClause: Record<string, unknown> = {}

    // If not admin, only show user's own requests
    if (payload.role !== 'admin') {
      whereClause.userId = payload.userId
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      whereClause.status = status
    }

        const wfhRequests = await prisma.wFHRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ wfhRequests })

  } catch (error) {
    console.error('WFH requests fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
