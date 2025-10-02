'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { 
  Clock, 
  Calendar, 
  Filter, 
  Download, 
  ArrowLeft,
  LogIn,
  LogOut,
  MapPin,
  QrCode,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Activity,
  TrendingUp
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { GlassCard, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

interface AttendanceRecord {
  id: string
  type: string
  method: string
  createdAt: string
  sessionId: string | null
  latitude?: number
  longitude?: number
}

export default function EmployeeLogsPage() {
  const [logs, setLogs] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [stats, setStats] = useState({
    totalRecords: 0,
    checkIns: 0,
    checkOuts: 0,
    averageHours: 0
  })
  const [exportLoading, setExportLoading] = useState(false)
  const [exportSuccess, setExportSuccess] = useState('')
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

    fetchLogs()
  }, [router, pagination.page, dateRange])

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })

      const response = await fetch(`/api/attendance/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / prev.limit)
        }))

        // Calculate stats
        const checkIns = data.logs?.filter((log: AttendanceRecord) => log.type === 'IN').length || 0
        const checkOuts = data.logs?.filter((log: AttendanceRecord) => log.type === 'OUT').length || 0
        
        setStats({
          totalRecords: data.total || 0,
          checkIns,
          checkOuts,
          averageHours: checkOuts > 0 ? (checkIns / checkOuts) * 8 : 0 // Simplified calculation
        })
      } else {
        setError('Failed to fetch attendance logs')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const exportLogs = async () => {
    setExportLoading(true)
    setExportSuccess('')

    try {
      const token = localStorage.getItem('token')
      
      // Create CSV content
      const csvHeaders = ['Date', 'Time', 'Type', 'Method', 'Session ID', 'Location']
      const csvRows = logs.map(log => {
        const date = new Date(log.createdAt)
        return [
          format(date, 'yyyy-MM-dd'),
          format(date, 'HH:mm:ss'),
          log.type,
          log.method,
          log.sessionId || '-',
          log.latitude && log.longitude ? `${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}` : '-'
        ]
      })

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `my-attendance-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setExportSuccess('Attendance logs exported successfully!')
      setTimeout(() => setExportSuccess(''), 3000)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExportLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'qr':
        return <QrCode className="h-4 w-4" />
      case 'nfc':
      case 'rfid':
        return <Smartphone className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'IN' 
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <GlassCard className="p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-lg font-medium">Loading attendance logs...</span>
          </div>
        </GlassCard>
      </div>
    )
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
      <header className="relative z-10 p-4">
        <GlassCard className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard/emp" className="flex items-center space-x-2">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Attendance Logs
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </GlassCard>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalRecords}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Check-ins</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.checkIns}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <LogIn className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Check-outs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.checkOuts}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                  <LogOut className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Hours</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averageHours.toFixed(1)}h
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Filters */}
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From:</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>

              <Button 
                onClick={exportLogs} 
                disabled={exportLoading || logs.length === 0}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {exportLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>Export CSV</span>
              </Button>
            </div>
          </GlassCard>

          {/* Export Success Message */}
          {exportSuccess && (
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-800 dark:text-green-200">{exportSuccess}</span>
              </div>
            </GlassCard>
          )}

          {/* Logs Table */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Attendance Records
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.id} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getTypeColor(log.type)}`}>
                          {log.type === 'IN' ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {log.type === 'IN' ? 'Check In' : 'Check Out'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                              {log.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {format(new Date(log.createdAt), 'MMM dd, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-1">
                          {getMethodIcon(log.method)}
                          <span className="capitalize">{log.method}</span>
                        </div>
                        {log.latitude && log.longitude && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>Located</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {logs.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No attendance records found for the selected date range
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-md text-sm">
                    {pagination.page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  )
}