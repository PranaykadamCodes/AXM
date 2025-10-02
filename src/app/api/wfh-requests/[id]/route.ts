import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// Update WFH request status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params
    const body = await request.json()
    const { status, adminComments } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (approved/rejected) is required' },
        { status: 400 }
      )
    }

    // Update WFH request
    const updatedRequest = await prisma.wFHRequest.update({
      where: { id: resolvedParams.id },
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
      message: `WFH request ${status} successfully`,
      wfhRequest: updatedRequest
    })

  } catch (error) {
    console.error('WFH request update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete WFH request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params
    
    // Get the WFH request to check ownership
    const wfhRequest = await prisma.wFHRequest.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!wfhRequest) {
      return NextResponse.json(
        { error: 'WFH request not found' },
        { status: 404 }
      )
    }

    // Only allow deletion by the request owner or admin
    if (wfhRequest.userId !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to delete this request' },
        { status: 403 }
      )
    }

    // Don't allow deletion of approved requests
    if (wfhRequest.status === 'approved') {
      return NextResponse.json(
        { error: 'Cannot delete approved WFH requests' },
        { status: 400 }
      )
    }

    await prisma.wFHRequest.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'WFH request deleted successfully'
    })

  } catch (error) {
    console.error('WFH request deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
