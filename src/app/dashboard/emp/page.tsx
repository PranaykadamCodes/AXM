'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, getTimeOfDay } from '@/lib/utils'

interface AttendanceRecord {
  id: string
  type: string
  method: string
  createdAt: string
  sessionId: string | null
}

interface User {
  id: string
  name: string
  email: string
  department: string | null
  position: string | null
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([])
  const [todayStats, setTodayStats] = useState({
    checkIns: 0,
    checkOuts: 0,
    workingHours: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

    setUser(parsedUser)
    fetchAttendanceData()
  }, [router])

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Get today's date range
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      // Fetch recent attendance logs
      const response = await fetch(`/api/attendance/logs?limit=10&startDate=${startOfDay}&endDate=${endOfDay}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data')
      }

      const data = await response.json()
      setRecentAttendance(data.logs)

      // Calculate today's stats
      const checkIns = data.logs.filter((log: AttendanceRecord) => log.type === 'IN').length
      const checkOuts = data.logs.filter((log: AttendanceRecord) => log.type === 'OUT').length
      
      // Calculate working hours (simplified - assumes IN/OUT pairs)
      let workingHours = 0
      const sessions: { [key: string]: { IN?: Date; OUT?: Date } } = {}
      
      data.logs.forEach((log: AttendanceRecord) => {
        if (log.sessionId) {
          if (!sessions[log.sessionId]) {
            sessions[log.sessionId] = {}
          }
          sessions[log.sessionId][log.type as 'IN' | 'OUT'] = new Date(log.createdAt)
        }
      })

      Object.values(sessions).forEach(session => {
        if (session.IN && session.OUT) {
          const hours = (session.OUT.getTime() - session.IN.getTime()) / (1000 * 60 * 60)
          workingHours += hours
        }
      })

      setTodayStats({
        checkIns,
        checkOuts,
        workingHours: Math.round(workingHours * 100) / 100
      })

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay()
    return `Good ${timeOfDay}, ${user?.name || 'Employee'}!`
  }

  const getLastAttendanceStatus = () => {
    if (recentAttendance.length === 0) return 'No attendance today'
    
    const latest = recentAttendance[0]
    const time = new Date(latest.createdAt).toLocaleTimeString()
    
    if (latest.type === 'IN') {
      return `Checked in at ${time}`
    } else {
      return `Checked out at ${time}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Employee Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/emp/logs"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                View Logs
              </Link>
              <Link
                href="/dashboard/emp/profile"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
              <Link
                href="/dashboard/emp/scan"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Mark Attendance
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getGreeting()}</h2>
              <p className="text-gray-600 mt-1">{getLastAttendanceStatus()}</p>
              {user?.department && user?.position && (
                <p className="text-sm text-gray-500 mt-1">
                  {user.position} - {user.department}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">↗</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Check-ins Today
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {todayStats.checkIns}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">↙</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Check-outs Today
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {todayStats.checkOuts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">⏱</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Working Hours
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {todayStats.workingHours}h
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Today's Attendance
            </h3>
            
            {recentAttendance.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentAttendance.map((record, index) => (
                    <li key={record.id}>
                      <div className="relative pb-8">
                        {index !== recentAttendance.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              record.type === 'IN' 
                                ? 'bg-green-500' 
                                : 'bg-red-500'
                            }`}>
                              <span className="text-white text-xs font-medium">
                                {record.type === 'IN' ? '↗' : '↙'}
                              </span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Checked <span className="font-medium text-gray-900">{record.type.toLowerCase()}</span> via {record.method}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {formatDate(record.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No attendance records for today</p>
                <Link
                  href="/dashboard/emp/scan"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Mark Your Attendance
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
