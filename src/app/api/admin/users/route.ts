import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// Get all users (Admin only) - Original working function
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const department = searchParams.get('department')

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    if (role) {
      whereClause.role = role
    }

    if (department) {
      whereClause.department = department
    }

    // Get users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          department: true,
          position: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              attendance: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new user (Admin only) - New function
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

    const body = await request.json()
    const { name, email, password, role, department, position, status } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'employee',
        department: department || null,
        position: position || null,
        status: status || 'active'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update user (Admin only) - Original working function
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

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { userId, name, department, position, role, status } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}

    if (name) updateData.name = name
    if (department !== undefined) updateData.department = department
    if (position !== undefined) updateData.position = position
    if (role && ['admin', 'employee'].includes(role)) updateData.role = role
    if (status && ['active', 'pending', 'inactive'].includes(status)) updateData.status = status

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        position: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}