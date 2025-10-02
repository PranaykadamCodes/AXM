import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateQRToken(userId: string, expiresInMinutes: number = 5): string {
  const payload = {
    userId,
    type: 'qr-attendance',
    exp: Math.floor(Date.now() / 1000) + (expiresInMinutes * 60)
  }
  return jwt.sign(payload, JWT_SECRET)
}

export function verifyQRToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.type === 'qr-attendance') {
      return { userId: decoded.userId }
    }
    return null
  } catch (error) {
    return null
  }
}
