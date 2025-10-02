'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  QrCode, 
  Smartphone, 
  MapPin, 
  Clock, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  Camera,
  LogIn,
  LogOut
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import QRScanner from '@/components/QRScanner'
import NFCReader from '@/components/NFCReader'

type ScanMethod = 'qr' | 'nfc'
type AttendanceType = 'IN' | 'OUT'

export default function ScanAttendancePage() {
  const [method, setMethod] = useState<ScanMethod>('qr')
  const [attendanceType, setAttendanceType] = useState<AttendanceType>('IN')
  const [isScanning, setIsScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role === 'admin') {
      router.push('/dashboard/admin')
      return
    }

    // Get user location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied:', error)
          // Continue without location
        }
      )
    }
  }, [router])

  const handleScan = async (data: string) => {
    if (loading) return
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrToken: data,
          type: attendanceType,
          method: method.toUpperCase(),
          latitude: location?.latitude,
          longitude: location?.longitude
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(`${attendanceType === 'IN' ? 'Check-in' : 'Check-out'} successful!`)
        setIsScanning(false)
        
        // Auto redirect after success
        setTimeout(() => {
          router.push('/dashboard/emp')
        }, 2000)
      } else {
        setError(result.error || 'Attendance marking failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNFCScan = async (uid: string) => {
    await handleScan(uid)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
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
                <Link href="/dashboard/emp" className="flex items-center space-x-1 sm:space-x-2">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
              <div className="flex items-center space-x-2 min-w-0">
                <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                  <span className="hidden sm:inline">Mark Attendance</span>
                  <span className="sm:hidden">Scan</span>
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
          {/* Method Selection */}
          <GlassCard className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-sm font-medium mb-4">
                <Zap className="h-4 w-4 mr-2" />
                Quick & Secure Attendance
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Scanning Method
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Select your preferred method to mark attendance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setMethod('qr')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  method === 'qr'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    method === 'qr' 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}>
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">QR Code</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Scan QR code with camera</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMethod('nfc')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  method === 'nfc'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    method === 'nfc' 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">NFC/RFID</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tap NFC card or tag</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Attendance Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAttendanceType('IN')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  attendanceType === 'IN'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <LogIn className={`h-5 w-5 ${
                    attendanceType === 'IN' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'
                  }`} />
                  <span className={`font-medium ${
                    attendanceType === 'IN' ? 'text-green-800 dark:text-green-200' : 'text-gray-900 dark:text-white'
                  }`}>
                    Check In
                  </span>
                </div>
              </button>

              <button
                onClick={() => setAttendanceType('OUT')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  attendanceType === 'OUT'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <LogOut className={`h-5 w-5 ${
                    attendanceType === 'OUT' ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'
                  }`} />
                  <span className={`font-medium ${
                    attendanceType === 'OUT' ? 'text-red-800 dark:text-red-200' : 'text-gray-900 dark:text-white'
                  }`}>
                    Check Out
                  </span>
                </div>
              </button>
            </div>
          </GlassCard>

          {/* Scanner Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scanner */}
            <GlassCard className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {method === 'qr' ? 'QR Code Scanner' : 'NFC Reader'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {method === 'qr' 
                    ? 'Point your camera at the QR code' 
                    : 'Tap your NFC card or tag on the device'
                  }
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button
                    onClick={() => setIsScanning(!isScanning)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isScanning
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    }`}
                  >
                    {isScanning ? 'Stop Scanning' : `Start ${method.toUpperCase()} Scanning`}
                  </Button>
                </div>

                {isScanning && (
                  <div className="mt-6">
                    {method === 'qr' ? (
                      <QRScanner
                        onScan={handleScan}
                        onError={handleError}
                        isScanning={isScanning}
                      />
                    ) : (
                      <NFCReader
                        onScan={handleNFCScan}
                        onError={handleError}
                        isScanning={isScanning}
                      />
                    )}
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Status & Info */}
            <div className="space-y-6">
              {/* Status Messages */}
              {(success || error || loading) && (
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status</h3>
                  
                  {loading && (
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-blue-800 dark:text-blue-200">Processing attendance...</span>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <span className="text-green-800 dark:text-green-200">{success}</span>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600" />
                      <span className="text-red-800 dark:text-red-200">{error}</span>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Current Settings */}
              <GlassCard className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Current Settings
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Method:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {method === 'qr' ? 'QR Code' : 'NFC/RFID'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Type:</span>
                    <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                      attendanceType === 'IN' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    }`}>
                      {attendanceType === 'IN' ? 'Check In' : 'Check Out'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Time:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  {location && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Location:
                      </span>
                      <span className="text-green-600 dark:text-green-400 text-sm">Enabled</span>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Instructions */}
              <GlassCard className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Instructions
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {method === 'qr' ? (
                    <>
                      <p>1. Click "Start QR Scanning" button</p>
                      <p>2. Allow camera access when prompted</p>
                      <p>3. Point camera at the QR code</p>
                      <p>4. Wait for automatic detection</p>
                    </>
                  ) : (
                    <>
                      <p>1. Click "Start NFC Scanning" button</p>
                      <p>2. Hold your NFC card near the device</p>
                      <p>3. Wait for the tap confirmation</p>
                      <p>4. Attendance will be recorded automatically</p>
                    </>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}