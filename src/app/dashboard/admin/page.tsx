'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar,
  QrCode,
  Smartphone,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Activity,
  UserCheck,
  UserX,
  Timer,
  Home
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, GlassCard } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/components/notifications"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'

interface Analytics {
  summary: {
    totalUsers: number
    activeUsers: number
    pendingUsers: number
    attendanceRate: number
    averageWorkingHours: number
    totalAttendanceRecords: number
  }
  charts: {
    dailyAttendance: Array<{ date: string; checkIns: number; checkOuts: number }>
    departmentAttendance: Array<{ department: string; count: number }>
    methodAttendance: Array<{ method: string; count: number }>
  }
}

const chartConfig = {
  checkIns: {
    label: "Check Ins",
    color: "hsl(var(--chart-1))",
  },
  checkOuts: {
    label: "Check Outs", 
    color: "hsl(var(--chart-2))",
  },
  count: {
    label: "Count",
    color: "hsl(var(--chart-3))",
  },
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('week')
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

    fetchAnalytics()
  }, [period, router])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        setError('Failed to fetch analytics')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

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
            <Button onClick={fetchAnalytics}>Retry</Button>
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
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-2 ml-8">
                <select 
                  value={period} 
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell userRole="admin" />
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </GlassCard>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics?.summary.totalUsers || 0}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics?.summary.activeUsers || 0}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  +8% from last week
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics?.summary.attendanceRate || 0}%
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  +2% from yesterday
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Work Hours</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics?.summary.averageWorkingHours || 0}h
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Standard: 8h
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <Timer className="h-6 w-6 text-white" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Attendance Chart */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Attendance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Check-ins and check-outs over time</p>
              </div>
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={analytics?.charts.dailyAttendance || []}>
                <defs>
                  <linearGradient id="colorCheckIns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCheckOuts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="checkIns" stroke="#8884d8" fillOpacity={1} fill="url(#colorCheckIns)" />
                <Area type="monotone" dataKey="checkOuts" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCheckOuts)" />
              </AreaChart>
            </ChartContainer>
          </GlassCard>

          {/* Department Attendance */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Department Attendance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Attendance by department</p>
              </div>
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={analytics?.charts.departmentAttendance || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics?.charts.departmentAttendance?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </GlassCard>
        </div>

        {/* Method Attendance & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Method Attendance */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Methods</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">How employees are checking in</p>
                </div>
                <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={analytics?.charts.methodAttendance || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="method" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="url(#gradient)" radius={[4, 4, 0, 0]}>
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8884d8" />
                        <stop offset="100%" stopColor="#82ca9d" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ChartContainer>
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <Button asChild className="w-full justify-start bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Link href="/dashboard/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/admin/qr">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/admin/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Link>
              </Button>
                <Button asChild className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <Link href="/dashboard/admin/leave-requests">
                    <Calendar className="h-4 w-4 mr-2" />
                    Leave Requests
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/admin/wfh-requests">
                    <Home className="h-4 w-4 mr-2" />
                    WFH Requests
                  </Link>
                </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </GlassCard>
        </div>
      </main>

    </div>
  )
}