import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, generateQRToken } from '@/lib/auth'
import QRCode from 'qrcode'

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

    const { expiryMinutes } = await request.json()
    const expiresInMinutes = expiryMinutes || 5

    // Generate QR token (not tied to specific user - will be used by any authenticated user)
    const qrToken = generateQRToken('attendance-system', expiresInMinutes)

    // Generate QR code image
    const qrCodeDataURL = await QRCode.toDataURL(qrToken, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return NextResponse.json({
      token: qrToken,
      qrCode: qrCodeDataURL,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString(),
      expiresInMinutes
    })

  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
