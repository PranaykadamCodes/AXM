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

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const notifications = []

    if (payload.role === 'admin') {
      // Get pending leave requests count
      const pendingLeaveRequests = await prisma.leaveRequest.count({
        where: { status: 'pending' }
      })

      if (pendingLeaveRequests > 0) {
        notifications.push({
          id: 'pending-leave-requests',
          type: 'warning',
          title: 'Pending Leave Requests',
          message: `${pendingLeaveRequests} leave request${pendingLeaveRequests > 1 ? 's' : ''} waiting for your approval`,
          createdAt: new Date().toISOString(),
          read: false,
          actionUrl: '/dashboard/admin/leave-requests'
        })
      }

      // Get pending users count
      const pendingUsers = await prisma.user.count({
        where: { status: 'pending' }
      })

      if (pendingUsers > 0) {
        notifications.push({
          id: 'pending-users',
          type: 'info',
          title: 'Pending User Approvals',
          message: `${pendingUsers} user${pendingUsers > 1 ? 's' : ''} waiting for approval`,
          createdAt: new Date().toISOString(),
          read: false,
          actionUrl: '/dashboard/admin/users'
        })
      }
    } else {
      // Employee notifications
      // Get user's recent leave requests
      const recentLeaveRequests = await prisma.leaveRequest.findMany({
        where: {
          userId: payload.userId,
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 3
      })

      for (const leaveRequest of recentLeaveRequests) {
        if (leaveRequest.status === 'approved') {
          notifications.push({
            id: `leave-approved-${leaveRequest.id}`,
            type: 'success',
            title: 'Leave Request Approved',
            message: `Your ${leaveRequest.type} leave request has been approved`,
            createdAt: leaveRequest.updatedAt.toISOString(),
            read: false,
            actionUrl: '/dashboard/emp/leave'
          })
        } else if (leaveRequest.status === 'rejected') {
          notifications.push({
            id: `leave-rejected-${leaveRequest.id}`,
            type: 'error',
            title: 'Leave Request Rejected',
            message: `Your ${leaveRequest.type} leave request has been rejected`,
            createdAt: leaveRequest.updatedAt.toISOString(),
            read: false,
            actionUrl: '/dashboard/emp/leave'
          })
        }
      }

      // Check if user hasn't marked attendance today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayAttendance = await prisma.attendance.findFirst({
        where: {
          userId: payload.userId,
          createdAt: {
            gte: today
          }
        }
      })

      if (!todayAttendance && new Date().getHours() >= 9) {
        notifications.push({
          id: 'attendance-reminder',
          type: 'warning',
          title: 'Attendance Reminder',
          message: 'Don\'t forget to mark your attendance today',
          createdAt: new Date().toISOString(),
          read: false,
          actionUrl: '/dashboard/emp/scan'
        })
      }
    }

    return NextResponse.json({ notifications })

  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}