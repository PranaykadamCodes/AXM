'use client'

import { useState, useEffect } from 'react'
import QrScanner from 'react-qr-barcode-scanner'

interface QRScannerProps {
  onScan: (data: string) => void
  onError: (error: string) => void
  isScanning: boolean
}

export default function QRScanner({ onScan, onError, isScanning }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [lastScanAt, setLastScanAt] = useState<number>(0)
  const cooldownMs = 1000

  useEffect(() => {
    // Check if camera is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false)
      onError('Camera not supported on this device')
      return
    }

    // Request camera permission with mobile-optimized constraints
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' }, // Prefer back camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then(() => setHasPermission(true))
      .catch((error) => {
        console.error('Camera permission error:', error)
        // Try with basic constraints if advanced ones fail
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(() => setHasPermission(true))
          .catch(() => {
            setHasPermission(false)
            onError('Camera permission denied. Please allow camera access and try again.')
          })
      })
  }, [onError])

  const handleScan = (result: string | null) => {
    if (!result || !isScanning) return
    const now = Date.now()
    if (now - lastScanAt < cooldownMs) return
    setLastScanAt(now)
    onScan(result)
  }

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error)
    onError('Failed to scan QR code. Please try again.')
  }

  if (!isSupported) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600">Camera not supported on this device</p>
      </div>
    )
  }

  if (hasPermission === false) {
    return (
      <div className="text-center p-8">
        <div className="text-yellow-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">Camera permission is required to scan QR codes</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Grant Permission
        </button>
      </div>
    )
  }

  if (hasPermission === null) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Requesting camera permission...</p>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative w-full h-80 sm:h-96 bg-gray-900 rounded-lg overflow-hidden">
        <div className="w-full h-full qr-scanner">
          <QrScanner
            onUpdate={(err, result) => {
              if (result && isScanning) {
                handleScan(result.getText())
              }
              if (err) {
                handleError(err)
              }
            }}
            // lower delay to improve responsiveness
            delay={100}
          />
        </div>
      </div>
      
      {/* Scanning overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative">
          {/* Scanning frame */}
          <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-white/70 rounded-lg relative">
            {/* Corner indicators */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-lg"></div>
            
            {/* Scanning line animation */}
            {isScanning && (
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse transform -translate-y-1/2"></div>
            )}
          </div>
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-400 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="text-center mt-4 px-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {isScanning ? 'Position QR code within the frame' : 'Scanner paused'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Make sure the QR code is well-lit and clearly visible
        </p>
      </div>
    </div>
  )
}
