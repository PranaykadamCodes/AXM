'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Download,
  Calendar,
  Users,
  Building,
  FileText,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface ReportSummary {
  totalRecords: number
  uniqueEmployees: number
  checkIns: number
  checkOuts: number
  departmentStats: Record<string, {
    checkIns: number
    checkOuts: number
    employeeCount: number
  }>
  period: {
    start: string | null
    end: string | null
  }
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    department: '',
    userId: ''
  })
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

    fetchReportSummary()
  }, [router])

  const fetchReportSummary = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required. Please log in again.')
        return
      }

          const params = new URLSearchParams()
          
          if (filters.startDate) params.append('startDate', filters.startDate)
          if (filters.endDate) params.append('endDate', filters.endDate)
          if (filters.department) params.append('department', filters.department)
          if (filters.userId) params.append('userId', filters.userId)
          params.append('format', 'json') // Ensure we get JSON for summary

          const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      } else {
        if (response.status === 401 || response.status === 403) {
          setError('Authentication failed. Please log in again.')
          // Redirect to login after a delay
          setTimeout(() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.push('/login')
          }, 2000)
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          setError(errorData.error || `Server error (${response.status})`)
        }
      }
    } catch (err) {
      console.error('Report fetch error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'excel' | 'json' = 'excel') => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required. Please log in again.')
        return
      }

      const params = new URLSearchParams()
      
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.department) params.append('department', filters.department)
      if (filters.userId) params.append('userId', filters.userId)
      params.append('format', format)

      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        if (format === 'excel') {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `attendance-report-${new Date().toISOString().split('T')[0]}.xlsx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          setSuccess('Report exported successfully!')
        } else {
          const data = await response.json()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `attendance-report-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          setSuccess('Report exported successfully!')
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          setError('Authentication failed. Please log in again.')
          setTimeout(() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.push('/login')
          }, 2000)
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          setError(errorData.error || `Export failed (${response.status})`)
        }
      }
    } catch (err) {
      console.error('Export error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const applyFilters = () => {
    fetchReportSummary()
  }

  const setQuickFilter = (days: number) => {
    const endDate = new Date()
    const startDate = subDays(endDate, days)
    setFilters({
      ...filters,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    })
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
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                  <span className="hidden sm:inline">Attendance Reports</span>
                  <span className="sm:hidden">Reports</span>
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </GlassCard>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Status Messages */}
          {(success || error) && (
            <GlassCard className="p-4">
              {success && (
                <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-800 dark:text-green-200">{success}</span>
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-800 dark:text-red-200">{error}</span>
                </div>
              )}
            </GlassCard>
          )}

          {/* Filters */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Report Filters
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="">All Departments</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID (Optional)
                </label>
                <input
                  type="text"
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  placeholder="Specific user ID"
                  className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Quick filters:</span>
              <Button variant="outline" size="sm" onClick={() => setQuickFilter(7)}>
                Last 7 days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickFilter(30)}>
                Last 30 days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickFilter(90)}>
                Last 90 days
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const now = new Date()
                  setFilters({
                    ...filters,
                    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
                    endDate: format(endOfMonth(now), 'yyyy-MM-dd')
                  })
                }}
              >
                This Month
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <Button onClick={applyFilters} disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Apply Filters
              </Button>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => exportReport('excel')} 
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button 
                  onClick={() => exportReport('json')} 
                  disabled={loading}
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Summary Statistics */}
          {summary && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlassCard className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Records</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalRecords}</p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Unique Employees</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.uniqueEmployees}</p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Check-ins</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.checkIns}</p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Check-outs</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.checkOuts}</p>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Department Statistics */}
              <GlassCard className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Building className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Department Statistics
                  </h2>
                </div>

                {Object.keys(summary.departmentStats).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Department</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Employees</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Check-ins</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Check-outs</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Attendance Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(summary.departmentStats).map(([dept, stats]) => (
                          <tr key={dept} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{dept}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{stats.employeeCount}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{stats.checkIns}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{stats.checkOuts}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                    style={{ 
                                      width: `${Math.min((stats.checkOuts / Math.max(stats.checkIns, 1)) * 100, 100)}%` 
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  {Math.round((stats.checkOuts / Math.max(stats.checkIns, 1)) * 100)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No department data available for the selected period</p>
                  </div>
                )}
              </GlassCard>

              {/* Report Period Info */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Report Period</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {summary.period.start && summary.period.end ? (
                        `${format(new Date(summary.period.start), 'MMM dd, yyyy')} - ${format(new Date(summary.period.end), 'MMM dd, yyyy')}`
                      ) : (
                        'All time'
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Generated on</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {format(new Date(), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
