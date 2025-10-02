'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface QRData {
  token: string
  qrCode: string
  expiresAt: string
  expiresInMinutes: number
}

export default function QRGeneratorPage() {
  const [qrData, setQrData] = useState<QRData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expiryMinutes, setExpiryMinutes] = useState(5)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== 'admin') {
      router.push('/dashboard/emp')
      return
    }
  }, [router])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (qrData) {
      interval = setInterval(() => {
        const now = new Date().getTime()
        const expiry = new Date(qrData.expiresAt).getTime()
        const difference = expiry - now

        if (difference > 0) {
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        } else {
          setTimeLeft('Expired')
          if (interval) clearInterval(interval)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [qrData])

  const generateQR = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/generate-qr?expires=${expiryMinutes}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to generate QR code')
      }

      const data = await response.json()
      setQrData(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    if (!qrData) return

    const link = document.createElement('a')
    link.download = `attendance-qr-${new Date().toISOString().split('T')[0]}.png`
    link.href = qrData.qrCode
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/admin"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">QR Code Generator</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Generate Attendance QR Code</h2>
            <p className="text-sm text-gray-600 mb-4">
              Generate a QR code that employees can scan to mark their attendance. The QR code will expire after the specified time.
            </p>

            <div className="flex items-center space-x-4 mb-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                  Expiry Time (minutes)
                </label>
                <select
                  id="expiry"
                  value={expiryMinutes}
                  onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={generateQR}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate QR Code'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
          </div>

          {qrData && (
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code Display */}
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code</h3>
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <Image
                      src={qrData.qrCode}
                      alt="Attendance QR Code"
                      width={300}
                      height={300}
                      className="mx-auto"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={downloadQR}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Download QR Code
                    </button>
                    <button
                      onClick={generateQR}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Generate New QR Code
                    </button>
                  </div>
                </div>

                {/* QR Code Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code Information</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          timeLeft === 'Expired' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {timeLeft === 'Expired' ? 'Expired' : 'Active'}
                        </span>
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Time Remaining</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">
                        {timeLeft || 'Calculating...'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Expires At</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(qrData.expiresAt).toLocaleString()}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Validity Period</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {qrData.expiresInMinutes} minutes
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Token (for debugging)</dt>
                      <dd className="mt-1 text-xs text-gray-600 font-mono break-all">
                        {qrData.token}
                      </dd>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Employees can scan this QR code with their mobile devices</li>
                      <li>• They need to be logged in to the attendance app</li>
                      <li>• The QR code will automatically expire after the set time</li>
                      <li>• Generate a new QR code when the current one expires</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
