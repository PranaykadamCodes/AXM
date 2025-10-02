import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// Update leave request status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { status, adminComments } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (approved/rejected) is required' },
        { status: 400 }
      )
    }

    // Update leave request
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: {
        status,
        adminComments: adminComments || null,
        reviewedAt: new Date(),
        reviewedBy: payload.userId
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
      message: `Leave request ${status} successfully`,
      leaveRequest: updatedRequest
    })

  } catch (error) {
    console.error('Leave request update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete leave request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the leave request to check ownership
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: params.id }
    })

    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      )
    }

    // Only allow deletion by the request owner or admin
    if (leaveRequest.userId !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to delete this request' },
        { status: 403 }
      )
    }

    // Don't allow deletion of approved requests
    if (leaveRequest.status === 'approved') {
      return NextResponse.json(
        { error: 'Cannot delete approved leave requests' },
        { status: 400 }
      )
    }

    await prisma.leaveRequest.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Leave request deleted successfully'
    })

  } catch (error) {
    console.error('Leave request deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
