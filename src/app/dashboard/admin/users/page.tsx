'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Building,
  Briefcase,
  MoreVertical,
  Edit,
  Trash2,
  Shield
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { GlassCard, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

interface User {
  id: string
  email: string
  name: string
  department: string | null
  position: string | null
  role: string
  status: string
  createdAt: string
  _count: {
    attendance: number
  }
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
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

    fetchUsers()
  }, [router])

  useEffect(() => {
    let filtered = users

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(user => user.status === filter)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.position?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [users, filter, searchTerm])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, status }),
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
      } else {
        setError('Failed to update user status')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
      case 'inactive':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'inactive':
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <GlassCard className="p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-lg font-medium">Loading users...</span>
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
                <Link href="/dashboard/admin" className="flex items-center space-x-2">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  User Management
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
          {/* Controls */}
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm w-full sm:w-64"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm appearance-none"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </GlassCard>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.length}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Inactive</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.status === 'inactive').length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Users List */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Users ({filteredUsers.length})
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {getStatusIcon(user.status)}
                            <span className="ml-1 capitalize">{user.status}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.department && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Building className="h-4 w-4" />
                        <span>{user.department}</span>
                      </div>
                    )}
                    {user.position && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Briefcase className="h-4 w-4" />
                        <span>{user.position}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {user._count.attendance} records
                      </span>
                      <div className="flex items-center space-x-1">
                        {user.role === 'admin' && (
                          <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                            <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                          </div>
                        )}
                        {user.status === 'pending' && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              onClick={() => updateUserStatus(user.id, 'active')}
                              className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserStatus(user.id, 'inactive')}
                              className="h-6 px-2 text-xs"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filter !== 'all' ? 'No users match your criteria' : 'No users found'}
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  )
}