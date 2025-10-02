'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    setIsScanning(false)

    try {
      const token = localStorage.getItem('token')
      const endpoint = method === 'qr' ? '/api/attendance/scan' : '/api/attendance/nfc'
      
      const requestBody = {
        type: attendanceType,
        latitude: location?.latitude,
        longitude: location?.longitude,
        ...(method === 'qr' ? { qrToken: data } : { tagUid: data })
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark attendance')
      }

      setSuccess(result.message)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/emp')
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to mark attendance')
      setIsScanning(true) // Resume scanning on error
    } finally {
      setLoading(false)
    }
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const startScanning = () => {
    setIsScanning(true)
    setError('')
    setSuccess('')
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/emp"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Mark Attendance</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Method Selection */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Scanning Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setMethod('qr')
                setIsScanning(false)
                setError('')
                setSuccess('')
              }}
              className={`p-4 rounded-lg border-2 text-center ${
                method === 'qr'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📱</div>
              <div className="font-medium">QR Code</div>
              <div className="text-sm text-gray-500">Scan QR code with camera</div>
            </button>

            <button
              onClick={() => {
                setMethod('nfc')
                setIsScanning(false)
                setError('')
                setSuccess('')
              }}
              className={`p-4 rounded-lg border-2 text-center ${
                method === 'nfc'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📡</div>
              <div className="font-medium">NFC/RFID</div>
              <div className="text-sm text-gray-500">Tap NFC card or tag</div>
            </button>
          </div>
        </div>

        {/* Attendance Type Selection */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setAttendanceType('IN')}
              className={`p-4 rounded-lg border-2 text-center ${
                attendanceType === 'IN'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🟢</div>
              <div className="font-medium">Check In</div>
              <div className="text-sm text-gray-500">Mark arrival</div>
            </button>

            <button
              onClick={() => setAttendanceType('OUT')}
              className={`p-4 rounded-lg border-2 text-center ${
                attendanceType === 'OUT'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🔴</div>
              <div className="font-medium">Check Out</div>
              <div className="text-sm text-gray-500">Mark departure</div>
            </button>
          </div>
        </div>

        {/* Scanner Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {method === 'qr' ? 'QR Code Scanner' : 'NFC Reader'}
            </h3>
            {!isScanning && !loading && !success && (
              <button
                onClick={startScanning}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Start {method === 'qr' ? 'Scanning' : 'NFC Reading'}
              </button>
            )}
            {isScanning && (
              <button
                onClick={stopScanning}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Stop
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
              <div className="text-xs text-green-600 mt-1">
                Redirecting to dashboard...
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing attendance...</p>
            </div>
          )}

          {!loading && !success && (
            <>
              {method === 'qr' ? (
                <QRScanner
                  onScan={handleScan}
                  onError={handleError}
                  isScanning={isScanning}
                />
              ) : (
                <NFCReader
                  onScan={handleScan}
                  onError={handleError}
                  isScanning={isScanning}
                />
              )}
            </>
          )}

          {/* Instructions */}
          {!isScanning && !loading && !success && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {method === 'qr' ? (
                  <>
                    <li>• Make sure your camera has permission to access</li>
                    <li>• Point your camera at the QR code</li>
                    <li>• Keep the QR code within the scanning frame</li>
                    <li>• Ensure good lighting for better scanning</li>
                  </>
                ) : (
                  <>
                    <li>• Make sure NFC is enabled on your device</li>
                    <li>• Hold your NFC card close to your phone</li>
                    <li>• Wait for the scanning confirmation</li>
                    <li>• Works with NFC cards, tags, and compatible devices</li>
                  </>
                )}
              </ul>
            </div>
          )}

          {/* Location Status */}
          {location && (
            <div className="mt-4 text-xs text-gray-500">
              Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
