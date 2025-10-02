'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Filter,
  Search,
  User,
  Building,
  MessageSquare,
  Check,
  X
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { format } from 'date-fns'

interface WFHRequest {
  id: string
  date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  adminComments?: string
  user: {
    id: string
    name: string
    email: string
    department: string | null
    position: string | null
  }
}

export default function AdminWFHRequestsPage() {
  const [wfhRequests, setWfhRequests] = useState<WFHRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<WFHRequest | null>(null)
  const [adminComments, setAdminComments] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard/emp')
      return
    }

    fetchWFHRequests()
  }, [router])

  const fetchWFHRequests = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/wfh-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWfhRequests(data.wfhRequests || [])
      } else {
        setError('Failed to fetch WFH requests')
      }
    } catch (error) {
      console.error('Error fetching WFH requests:', error)
      setError('Failed to fetch WFH requests')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
    setActionLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/wfh-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          adminComments: adminComments || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${status} request`)
      }

      await fetchWFHRequests()
      setSuccess(`WFH request ${status} successfully!`)
      setSelectedRequest(null)
      setAdminComments('')

      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      setError(err.message || `Failed to ${status} request`)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    }
  }

  const filteredRequests = wfhRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter
    const matchesSearch = !searchTerm || 
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const pendingCount = wfhRequests.filter(req => req.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard/admin"
                className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WFH Requests</h1>
                {pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                    {pendingCount} pending
                  </span>
                )}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </GlassCard>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Success/Error Messages */}
          {error && (
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            </GlassCard>
          )}

          {success && (
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-800 dark:text-green-200">{success}</span>
              </div>
            </GlassCard>
          )}

          {/* Filters */}
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(status)}
                    className={filter === status ? "bg-indigo-600 text-white" : ""}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {status === 'pending' && pendingCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {pendingCount}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </GlassCard>

          {/* WFH Requests List */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              WFH Requests {filter !== 'all' && `(${filter})`}
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading WFH requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No WFH requests found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {filter === 'all' ? 'No WFH requests have been submitted yet.' : `No ${filter} requests found.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {format(new Date(request.date), 'EEEE, MMMM do, yyyy')}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                              <User className="h-4 w-4" />
                              <span>{request.user.name}</span>
                              <span>•</span>
                              <span>{request.user.email}</span>
                              {request.user.department && (
                                <>
                                  <span>•</span>
                                  <Building className="h-4 w-4" />
                                  <span>{request.user.department}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-gray-600 dark:text-gray-300 mb-2">
                            <strong>Reason:</strong> {request.reason}
                          </p>
                          
                          {request.adminComments && (
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              <strong>Admin Comments:</strong> {request.adminComments}
                            </p>
                          )}
                          
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Submitted on {format(new Date(request.createdAt), 'PPP')}
                          </p>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request)
                                // Auto-set to reject mode
                                setTimeout(() => handleAction(request.id, 'rejected'), 100)
                              }}
                              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </main>

      {/* Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Review WFH Request</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRequest(null)
                  setAdminComments('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>Employee:</strong> {selectedRequest.user.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>Date:</strong> {format(new Date(selectedRequest.date), 'PPP')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <strong>Reason:</strong> {selectedRequest.reason}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Comments (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    value={adminComments}
                    onChange={(e) => setAdminComments(e.target.value)}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    placeholder="Add any comments for the employee..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => handleAction(selectedRequest.id, 'rejected')}
                  disabled={actionLoading}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleAction(selectedRequest.id, 'approved')}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
