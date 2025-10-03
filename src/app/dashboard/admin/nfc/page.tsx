'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Smartphone, ArrowLeft, Shield, Zap, MapPin, CheckCircle, XCircle, Plus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import NFCReader from '@/components/NFCReader'

type AttendanceType = 'IN' | 'OUT'

export default function AdminNFCPage() {
  const [attendanceType, setAttendanceType] = useState<AttendanceType>('IN')
  const [isScanning, setIsScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tags, setTags] = useState<Array<{ id: string; uid: string; label: string; location?: string; isActive: boolean; createdAt: string }>>([])
  const [registerOpen, setRegisterOpen] = useState(false)
  const [registerForm, setRegisterForm] = useState({ uid: '', label: '', location: '' })
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (!token || !user) return router.push('/login')
    const data = JSON.parse(user)
    if (data.role !== 'admin') return router.push('/dashboard/emp')
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {}
      )
    }
  }, [router])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/admin/nfc-tags', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setTags(data.tags || [])
      } catch {}
    }
    fetchTags()
  }, [])

  const handleScan = async (tagUid: string) => {
    if (loading) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/attendance/nfc', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tagUid,
          type: attendanceType,
          latitude: location?.latitude,
          longitude: location?.longitude,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'NFC attendance failed')
      setSuccess(`Admin ${attendanceType === 'IN' ? 'check-in' : 'check-out'} recorded`)
      setIsScanning(false)
    } catch (e: any) {
      setError(e.message || 'Failed to record attendance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-4000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float animation-delay-6000"></div>
      </div>

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
                <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                  <span className="hidden sm:inline">Admin NFC Attendance</span>
                  <span className="sm:hidden">NFC Attendance</span>
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </GlassCard>
      </header>

      <main className="relative z-10 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <GlassCard className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-sm font-medium mb-4">
                <Zap className="h-4 w-4 mr-2" />
                Secure NFC Attendance
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Type</h2>
              <p className="text-gray-600 dark:text-gray-300">Tap an NFC tag to record attendance</p>
            </div>

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
                  <Shield className={`h-5 w-5 ${attendanceType === 'IN' ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`} />
                  <span className="font-medium">Check In</span>
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
                  <Shield className={`h-5 w-5 ${attendanceType === 'OUT' ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`} />
                  <span className="font-medium">Check Out</span>
                </div>
              </button>
            </div>

            <div className="flex justify-center mt-6">
              <Button onClick={() => setIsScanning(!isScanning)} className={`px-6 py-3 ${isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} text-white`}>
                {isScanning ? 'Stop Scanning' : 'Start NFC Scanning'}
              </Button>
            </div>

            {isScanning && (
              <div className="mt-6">
                <NFCReader onScan={(uid) => handleScan(uid)} onError={setError} isScanning={isScanning} />
              </div>
            )}

            {(success || error || loading) && (
              <div className="mt-6 space-y-3">
                {loading && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-blue-800 dark:text-blue-200">Processing...</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-200">{success}</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800 dark:text-red-200">{error}</span>
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Registered NFC Tags</h3>
              </div>
              <Button onClick={() => setRegisterOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Register Tag
              </Button>
            </div>
            {tags.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">No tags registered yet.</p>
            ) : (
              <div className="space-y-3">
                {tags.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-white/40 dark:bg-gray-800/30 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{t.label}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">UID: {t.uid}</div>
                      {t.location && <div className="text-xs text-gray-600 dark:text-gray-300">Location: {t.location}</div>}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{t.isActive ? 'Active' : 'Inactive'}</div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {registerOpen && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Register NFC Tag</h3>
                <Button variant="ghost" onClick={() => setRegisterOpen(false)}>Close</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  value={registerForm.uid}
                  onChange={(e) => setRegisterForm({ ...registerForm, uid: e.target.value })}
                  placeholder="Tag UID"
                  className="px-3 py-2 rounded-md bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  value={registerForm.label}
                  onChange={(e) => setRegisterForm({ ...registerForm, label: e.target.value })}
                  placeholder="Label"
                  className="px-3 py-2 rounded-md bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  value={registerForm.location}
                  onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                  placeholder="Location (optional)"
                  className="px-3 py-2 rounded-md bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={async () => {
                    try {
                      setLoading(true)
                      const token = localStorage.getItem('token')
                      const res = await fetch('/api/admin/nfc-tags', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(registerForm),
                      })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || 'Failed to register tag')
                      setTags((prev) => [data.tag, ...prev])
                      setRegisterForm({ uid: '', label: '', location: '' })
                      setRegisterOpen(false)
                      setSuccess('Tag registered successfully')
                    } catch (e: any) {
                      setError(e.message || 'Failed to register tag')
                    } finally {
                      setLoading(false)
                    }
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Save Tag
                </Button>
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {location ? 'Location enabled' : 'Location not available'}
            </p>
          </GlassCard>
        </div>
      </main>
    </div>
  )
}


