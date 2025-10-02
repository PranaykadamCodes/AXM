'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { 
  Clock, 
  Calendar as CalendarIcon,
  QrCode,
  User,
  LogOut,
  Bell,
  TrendingUp,
  CheckCircle,
  XCircle,
  Timer,
  MapPin,
  Activity,
  Coffee,
  Target,
  Settings,
  Home
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, GlassCard } from "@/components/ui/card"
import { CustomCalendar } from "@/components/ui/custom-calendar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/components/notifications"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts'

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

interface DayAttendance {
  date: string
  checkIn: string | null
  checkOut: string | null
  workingHours: number
  status: 'present' | 'absent' | 'partial'
}

const chartConfig = {
  workingHours: {
    label: "Working Hours",
    color: "hsl(var(--chart-1))",
  },
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([])
  const [monthlyAttendance, setMonthlyAttendance] = useState<DayAttendance[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [todayStats, setTodayStats] = useState({
    checkIns: 0,
    checkOuts: 0,
    workingHours: 0,
    status: 'absent' as 'present' | 'absent' | 'partial'
  })
  const [weeklyStats, setWeeklyStats] = useState<Array<{date: string, hours: number}>>([])
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
      const today = new Date()
      const startDate = format(startOfMonth(today), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(today), 'yyyy-MM-dd')

      // Fetch recent attendance
      const recentResponse = await fetch(`/api/attendance/logs?limit=10&startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        setRecentAttendance(recentData.logs || [])
        
        // Calculate today's stats
        const todayRecords = recentData.logs?.filter((record: AttendanceRecord) => 
          isSameDay(new Date(record.createdAt), today)
        ) || []
        
        const checkIns = todayRecords.filter((r: AttendanceRecord) => r.type === 'IN').length
        const checkOuts = todayRecords.filter((r: AttendanceRecord) => r.type === 'OUT').length
        
        // Calculate working hours (simplified)
        let workingHours = 0
        if (checkIns > 0 && checkOuts > 0) {
          const lastCheckIn = todayRecords.filter((r: AttendanceRecord) => r.type === 'IN').pop()
          const lastCheckOut = todayRecords.filter((r: AttendanceRecord) => r.type === 'OUT').pop()
          if (lastCheckIn && lastCheckOut) {
            workingHours = (new Date(lastCheckOut.createdAt).getTime() - new Date(lastCheckIn.createdAt).getTime()) / (1000 * 60 * 60)
          }
        }

        const status = checkIns > 0 ? (checkOuts > 0 ? 'present' : 'partial') : 'absent'
        
        setTodayStats({ checkIns, checkOuts, workingHours, status })

        // Generate monthly attendance data
        const monthDays = eachDayOfInterval({
          start: startOfMonth(today),
          end: endOfMonth(today)
        })

        const monthlyData = monthDays.map(day => {
          const dayRecords = recentData.logs?.filter((record: AttendanceRecord) => 
            isSameDay(new Date(record.createdAt), day)
          ) || []
          
          const dayCheckIns = dayRecords.filter((r: AttendanceRecord) => r.type === 'IN')
          const dayCheckOuts = dayRecords.filter((r: AttendanceRecord) => r.type === 'OUT')
          
          let dayWorkingHours = 0
          if (dayCheckIns.length > 0 && dayCheckOuts.length > 0) {
            const firstCheckIn = dayCheckIns[0]
            const lastCheckOut = dayCheckOuts[dayCheckOuts.length - 1]
            dayWorkingHours = (new Date(lastCheckOut.createdAt).getTime() - new Date(firstCheckIn.createdAt).getTime()) / (1000 * 60 * 60)
          }

          const dayStatus: 'present' | 'absent' | 'partial' = dayCheckIns.length > 0 ? (dayCheckOuts.length > 0 ? 'present' : 'partial') : 'absent'

          return {
            date: format(day, 'yyyy-MM-dd'),
            checkIn: dayCheckIns[0]?.createdAt || null,
            checkOut: dayCheckOuts[dayCheckOuts.length - 1]?.createdAt || null,
            workingHours: Math.max(0, dayWorkingHours),
            status: dayStatus
          }
        })

        setMonthlyAttendance(monthlyData)

        // Generate weekly stats for chart
        const last7Days = monthlyData.slice(-7).map(day => ({
          date: format(new Date(day.date), 'MMM dd'),
          hours: day.workingHours
        }))
        setWeeklyStats(last7Days)
      }
    } catch (err) {
      setError('Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getAttendanceForDate = (date: Date) => {
    return monthlyAttendance.find(attendance => 
      isSameDay(new Date(attendance.date), date)
    )
  }

  const selectedDateAttendance = getAttendanceForDate(selectedDate)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <GlassCard className="p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-lg font-medium">Loading dashboard...</span>
          </div>
        </GlassCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <GlassCard className="p-8">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium mb-4">Error: {error}</div>
            <Button onClick={fetchAttendanceData}>Retry</Button>
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
      <header className="relative z-10 p-2 sm:p-4">
        <GlassCard className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="flex items-center space-x-2 min-w-0">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    <span className="hidden sm:inline">Welcome back, {user?.name}</span>
                    <span className="sm:hidden">Hi, {user?.name?.split(' ')[0]}</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                    <span className="hidden sm:inline">{user?.position} • {user?.department}</span>
                    <span className="sm:hidden">{user?.position}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
              <NotificationBell userRole="employee" />
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 sm:h-10 sm:w-10">
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </GlassCard>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4 space-y-6">
        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today&apos;s Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {todayStats.status}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                todayStats.status === 'present' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                todayStats.status === 'partial' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                {todayStats.status === 'present' ? <CheckCircle className="h-6 w-6 text-white" /> :
                 todayStats.status === 'partial' ? <Clock className="h-6 w-6 text-white" /> :
                 <XCircle className="h-6 w-6 text-white" />}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Check-ins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.checkIns}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Check-outs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.checkOuts}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Coffee className="h-6 w-6 text-white" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Hours Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.workingHours.toFixed(1)}h
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                <Timer className="h-6 w-6 text-white" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Calendar and Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="xl:col-span-1">
            <GlassCard className="p-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">Attendance Calendar</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Click on a date to see details</p>
                </div>
                <CalendarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              
              <div className="w-full">
                <CustomCalendar
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date)}
                  className="w-full"
                  modifiers={{
                    present: (date) => getAttendanceForDate(date)?.status === 'present',
                    partial: (date) => getAttendanceForDate(date)?.status === 'partial',
                    absent: (date) => getAttendanceForDate(date)?.status === 'absent' && date <= new Date(),
                  }}
                  modifiersStyles={{
                    present: { 
                      backgroundColor: '#10b981', 
                      color: 'white', 
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      border: '2px solid #059669'
                    },
                    partial: { 
                      backgroundColor: '#f59e0b', 
                      color: 'white', 
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      border: '2px solid #d97706'
                    },
                    absent: { 
                      backgroundColor: '#ef4444', 
                      color: 'white', 
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      border: '2px solid #dc2626'
                    },
                  }}
                />
              </div>
              
              {/* Calendar Legend */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Legend</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-md border-2 border-emerald-600"></div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Present</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-amber-500 rounded-md border-2 border-amber-600"></div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Partial</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-md border-2 border-red-600"></div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Absent</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Weekly Hours Chart */}
          <div className="xl:col-span-2">
            <GlassCard className="p-6 h-fit">
              <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">Weekly Hours</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Your working hours over the past week</p>
              </div>
                <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <AreaChart data={weeklyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.6)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.6)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorHours)" 
                  />
                </AreaChart>
              </ChartContainer>
            </GlassCard>
          </div>
        </div>

        {/* Selected Date Details & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selected Date Details */}
          <GlassCard className="p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {format(selectedDate, 'MMMM dd, yyyy')}
              {isToday(selectedDate) && <span className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 ml-2">(Today)</span>}
            </h3>
            
            {selectedDateAttendance ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedDateAttendance.status === 'present' ? 'bg-emerald-500' :
                      selectedDateAttendance.status === 'partial' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="font-medium capitalize">{selectedDateAttendance.status}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedDateAttendance.workingHours.toFixed(1)} hours
                  </span>
                </div>
                
                {selectedDateAttendance.checkIn && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">Check In</p>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        {format(new Date(selectedDateAttendance.checkIn), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedDateAttendance.checkOut && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Check Out</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {format(new Date(selectedDateAttendance.checkOut), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No attendance data for this date</p>
              </div>
            )}
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard className="p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <Button asChild className="w-full justify-start bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Link href="/dashboard/emp/scan">
                  <QrCode className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/emp/logs">
                  <Clock className="h-4 w-4 mr-2" />
                  View Attendance Logs
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/emp/profile">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Link>
              </Button>
                  <Button asChild className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    <Link href="/dashboard/emp/leave">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Request Leave
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/emp/wfh">
                      <Home className="h-4 w-4 mr-2" />
                      Work From Home
                    </Link>
                  </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/emp/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </GlassCard>
        </div>
      </main>

    </div>
  )
}