'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Calendar, 
  Clock, 
  FileText, 
  Send, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { format, addDays } from 'date-fns'

interface WFHRequest {
  id: string
  date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  adminComments?: string
}

export default function WFHPage() {
  const [wfhRequests, setWfhRequests] = useState<WFHRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    date: '',
    reason: ''
  })

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

    fetchWFHRequests()
  }, [router])

  const fetchWFHRequests = async () => {
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate date is not in the past
      const wfhDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (wfhDate < today) {
        throw new Error('WFH date cannot be in the past')
      }

      // Submit WFH request to API
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/wfh-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formData.date,
          reason: formData.reason
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit WFH request')
      }

      // Refresh the WFH requests list
      await fetchWFHRequests()
      
      setSuccess('WFH request submitted successfully!')
      setShowForm(false)
      setFormData({
        date: '',
        reason: ''
      })

      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit WFH request')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(new Date(request.date), 'PPP').toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

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
                href="/dashboard/emp"
                className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Work From Home</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Request WFH
              </Button>
            </div>
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
                <AlertCircle className="h-5 w-5 text-red-500" />
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your WFH Requests</h2>
            
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No WFH requests found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {filter === 'all' ? 'You haven\'t submitted any WFH requests yet.' : `No ${filter} requests found.`}
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Request
                </Button>
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
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(request.status)}
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {format(new Date(request.date), 'EEEE, MMMM do, yyyy')}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </main>

      {/* WFH Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Request Work From Home</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WFH Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    placeholder="Please provide a reason for your WFH request..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
