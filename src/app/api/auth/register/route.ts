import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { isValidEmail } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, department, position } = await request.json()

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
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
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with pending status
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        department: department || null,
        position: position || null,
        status: 'pending' // Requires admin approval
      },
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        position: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Registration successful. Please wait for admin approval.',
      user
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
