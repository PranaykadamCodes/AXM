import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

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

    const body = await request.json()
    const { name, email, department, position, currentPassword, newPassword } = body

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If changing password, verify current password
    if (newPassword && currentPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (name) updateData.name = name
    if (email && email !== currentUser.email) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser && existingUser.id !== currentUser.id) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        )
      }
      updateData.email = email
    }
    if (department !== undefined) updateData.department = department
    if (position !== undefined) updateData.position = position
    
    // Hash new password if provided
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        position: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        position: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
