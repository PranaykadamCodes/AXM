import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tags = await prisma.nFCTag.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ tags })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { uid, label, location } = await request.json()
    if (!uid || !label) {
      return NextResponse.json({ error: 'UID and label are required' }, { status: 400 })
    }

    const tag = await prisma.nFCTag.create({
      data: {
        uid,
        label,
        location,
        createdBy: payload.userId,
      },
    })
    return NextResponse.json({ tag })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Tag UID already registered' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


