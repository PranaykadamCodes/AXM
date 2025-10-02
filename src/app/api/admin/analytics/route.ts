import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

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

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // 'day', 'week', 'month'

    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get total users
    const totalUsers = await prisma.user.count({
      where: { role: 'employee' }
    })

    const activeUsers = await prisma.user.count({
      where: { role: 'employee', status: 'active' }
    })

    const pendingUsers = await prisma.user.count({
      where: { role: 'employee', status: 'pending' }
    })

    // Get attendance data for the period
    const attendanceData = await prisma.attendance.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Calculate daily attendance counts
    const dailyAttendance = attendanceData.reduce((acc: any, record) => {
      const date = record.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { date, checkIns: 0, checkOuts: 0 }
      }
      if (record.type === 'IN') {
        acc[date].checkIns++
      } else {
        acc[date].checkOuts++
      }
      return acc
    }, {})

    // Calculate department-wise attendance
    const departmentAttendance = attendanceData.reduce((acc: any, record) => {
      const dept = record.user.department || 'Unknown'
      if (!acc[dept]) {
        acc[dept] = { department: dept, count: 0 }
      }
      acc[dept].count++
      return acc
    }, {})

    // Calculate method-wise attendance
    const methodAttendance = attendanceData.reduce((acc: any, record) => {
      if (!acc[record.method]) {
        acc[record.method] = { method: record.method, count: 0 }
      }
      acc[record.method].count++
      return acc
    }, {})

    // Get unique users who attended in the period
    const uniqueAttendees = new Set(attendanceData.map(record => record.userId))
    const attendanceRate = totalUsers > 0 ? (uniqueAttendees.size / activeUsers) * 100 : 0

    // Calculate average working hours (simplified - assumes IN/OUT pairs)
    const sessions = attendanceData.reduce((acc: any, record) => {
      if (record.sessionId && !acc[record.sessionId]) {
        acc[record.sessionId] = {}
      }
      if (record.sessionId) {
        acc[record.sessionId][record.type] = record.createdAt
      }
      return acc
    }, {})

    let totalWorkingHours = 0
    let sessionCount = 0

    Object.values(sessions).forEach((session: any) => {
      if (session.IN && session.OUT) {
        const hours = (session.OUT.getTime() - session.IN.getTime()) / (1000 * 60 * 60)
        totalWorkingHours += hours
        sessionCount++
      }
    })

    const averageWorkingHours = sessionCount > 0 ? totalWorkingHours / sessionCount : 0

    return NextResponse.json({
      summary: {
        totalUsers,
        activeUsers,
        pendingUsers,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        averageWorkingHours: Math.round(averageWorkingHours * 100) / 100,
        totalAttendanceRecords: attendanceData.length
      },
      charts: {
        dailyAttendance: Object.values(dailyAttendance),
        departmentAttendance: Object.values(departmentAttendance),
        methodAttendance: Object.values(methodAttendance)
      },
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString()
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
