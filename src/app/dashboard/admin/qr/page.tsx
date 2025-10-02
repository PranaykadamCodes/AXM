'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  QrCode, 
  Clock, 
  RefreshCw, 
  Download, 
  ArrowLeft,
  Timer,
  Zap,
  Shield,
  Activity
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { GlassCard, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

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

    // Load existing QR data from localStorage
    const savedQrData = localStorage.getItem('currentQrData')
    if (savedQrData) {
      try {
        const parsedData = JSON.parse(savedQrData)
        const now = new Date().getTime()
        const expiry = new Date(parsedData.expiresAt).getTime()
        
        // Only restore if QR is still valid
        if (expiry > now) {
          setQrData(parsedData)
        } else {
          // Remove expired QR from storage
          localStorage.removeItem('currentQrData')
        }
      } catch (e) {
        // Remove invalid data
        localStorage.removeItem('currentQrData')
      }
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
          const hours = Math.floor(difference / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)
          
          if (hours > 0) {
            setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
          } else {
            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
          }
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
      const response = await fetch('/api/admin/generate-qr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiryMinutes }),
      })

      if (response.ok) {
        const data = await response.json()
        setQrData(data)
        // Save QR data to localStorage for persistence
        localStorage.setItem('currentQrData', JSON.stringify(data))
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate QR code')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    if (qrData) {
      const link = document.createElement('a')
      link.href = qrData.qrCode
      link.download = `attendance-qr-${Date.now()}.png`
      link.click()
    }
  }

  const deleteQR = () => {
    setQrData(null)
    localStorage.removeItem('currentQrData')
    setTimeLeft('')
    setError('')
  }

  const refreshQR = () => {
    if (qrData) {
      generateQR()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-4000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float animation-delay-6000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-2 sm:p-4">
        <GlassCard className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button variant="ghost" asChild className="flex-shrink-0">
                <Link href="/dashboard/admin" className="flex items-center space-x-1 sm:space-x-2">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
              <div className="flex items-center space-x-2 min-w-0">
                <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                  <span className="hidden sm:inline">QR Code Generator</span>
                  <span className="sm:hidden">QR Generator</span>
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </GlassCard>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Generator Controls */}
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-sm font-medium mb-4">
                <Zap className="h-4 w-4 mr-2" />
                Generate Secure QR Codes
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Attendance QR Code
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Generate time-limited QR codes for secure attendance marking
              </p>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expiry Time:
                </label>
                <select
                  value={expiryMinutes}
                  onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                  className="bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={300}>5 hours</option>
                  <option value={600}>10 hours</option>
                  <option value={720}>12 hours</option>
                  <option value={1440}>24 hours</option>
                  <option value={10080}>1 week</option>
                </select>
              </div>

              <Button
                onClick={generateQR}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    <span>Generate QR Code</span>
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}
          </GlassCard>

          {/* QR Code Display */}
          {qrData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QR Code */}
              <GlassCard className="p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                      <QrCode className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Scan to Mark Attendance
                  </h3>
                  <div className="bg-white p-6 rounded-xl shadow-inner mb-6">
                    <Image
                      src={qrData.qrCode}
                      alt="QR Code"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={downloadQR}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                    <Button
                      onClick={refreshQR}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </Button>
                    <Button
                      onClick={deleteQR}
                      variant="destructive"
                      className="flex items-center space-x-2"
                    >
                      <Timer className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </GlassCard>

              {/* QR Info */}
              <div className="space-y-6">
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Timer className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Time Remaining
                      </h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      timeLeft === 'Expired' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    }`}>
                      {timeLeft}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Generated:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Expires:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(qrData.expiresAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Duration:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {qrData.expiresInMinutes} minutes
                      </span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Security Features
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">Time-limited access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">Unique token per session</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">Encrypted data transmission</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">Location tracking enabled</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Usage Instructions
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p>1. Display this QR code to employees</p>
                    <p>2. Employees scan with their mobile devices</p>
                    <p>3. Attendance is automatically recorded</p>
                    <p>4. Generate new codes when expired</p>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}