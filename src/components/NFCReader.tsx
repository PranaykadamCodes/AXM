'use client'

import { useState, useEffect } from 'react'

interface NFCReaderProps {
  onScan: (tagId: string) => void
  onError: (error: string) => void
  isScanning: boolean
}

export default function NFCReader({ onScan, onError, isScanning }: NFCReaderProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isReading, setIsReading] = useState(false)

  useEffect(() => {
    // Check if Web NFC is supported
    if ('NDEFReader' in window) {
      setIsSupported(true)
    } else {
      setIsSupported(false)
      onError('NFC not supported on this device or browser')
    }
  }, [onError])

  useEffect(() => {
    if (!isSupported || !isScanning) return

    let abortController: AbortController | null = null

    const startNFCReading = async () => {
      try {
        setIsReading(true)
        abortController = new AbortController()
        
        // @ts-ignore - NDEFReader is not in TypeScript types yet
        const ndef = new NDEFReader()
        
        await ndef.scan({ signal: abortController.signal })
        
        ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
          console.log('NFC tag detected:', serialNumber)
          onScan(`nfc_${serialNumber}`)
        })

        ndef.addEventListener('readingerror', () => {
          onError('Failed to read NFC tag')
        })

      } catch (error: any) {
        console.error('NFC reading error:', error)
        if (error.name === 'NotAllowedError') {
          onError('NFC permission denied')
        } else if (error.name === 'NotSupportedError') {
          onError('NFC not supported')
        } else {
          onError('Failed to start NFC reading')
        }
      } finally {
        setIsReading(false)
      }
    }

    startNFCReading()

    return () => {
      if (abortController) {
        abortController.abort()
      }
      setIsReading(false)
    }
  }, [isSupported, isScanning, onScan, onError])

  if (!isSupported) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">NFC not supported</p>
        <p className="text-sm text-gray-500">
          NFC is only supported on Android devices with Chrome browser
        </p>
      </div>
    )
  }

  return (
    <div className="text-center p-8">
      <div className="relative">
        {/* NFC Icon */}
        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
          isReading ? 'bg-indigo-100 animate-pulse' : 'bg-gray-100'
        }`}>
          <svg 
            className={`w-12 h-12 ${isReading ? 'text-indigo-600' : 'text-gray-400'}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M20,2H4A2,2 0 0,0 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4A2,2 0 0,0 20,2M20,20H4V4H20V20M18,6H16.5A2.5,2.5 0 0,0 14,8.5V9.5A1.5,1.5 0 0,1 12.5,11H11V13H12.5A3.5,3.5 0 0,0 16,9.5V8.5A0.5,0.5 0 0,1 16.5,8H18V6M6,6V8H7.5A0.5,0.5 0 0,1 8,8.5V9.5A3.5,3.5 0 0,0 11.5,13H13V11H11.5A1.5,1.5 0 0,1 10,9.5V8.5A2.5,2.5 0 0,0 7.5,6H6Z" />
          </svg>
        </div>

        {/* Ripple effect when scanning */}
        {isReading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-indigo-300 animate-ping"></div>
          </div>
        )}
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {isReading ? 'NFC Reader Active' : 'NFC Reader Ready'}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        {isReading 
          ? 'Hold your NFC card or device near your phone'
          : 'Tap the button below to start NFC scanning'
        }
      </p>

      {!isScanning && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            • Make sure NFC is enabled on your device
          </p>
          <p className="text-xs text-gray-500">
            • Hold the NFC tag close to your phone
          </p>
          <p className="text-xs text-gray-500">
            • Works with NFC cards, tags, and compatible devices
          </p>
        </div>
      )}

      {isReading && (
        <div className="mt-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2 animate-pulse"></div>
            Scanning for NFC tags...
          </div>
        </div>
      )}
    </div>
  )
}
