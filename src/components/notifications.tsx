'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, Info, Calendar, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format } from 'date-fns'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  createdAt: string
  read: boolean
  actionUrl?: string
}

interface NotificationsProps {
  userRole: 'admin' | 'employee'
}

export function NotificationBell({ userRole }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [userRole])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20'
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {showDropdown && (
        <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-[999998]" 
                onClick={() => setShowDropdown(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-3 w-80 z-[999999]">
                <div className="relative">
                  {/* Arrow pointing up */}
                  <div className="absolute -top-2 right-4 w-4 h-4 bg-white/95 dark:bg-gray-900/95 border-l border-t border-white/30 transform rotate-45 z-[999999]"></div>
                  <GlassCard className="p-0 max-h-96 overflow-hidden shadow-2xl border border-white/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl relative z-[999999]">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  !notification.read 
                                    ? 'text-gray-900 dark:text-white' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {notification.actionUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  markAsRead(notification.id)
                                  window.location.href = notification.actionUrl!
                                }}
                                className="mt-2 h-6 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-0"
                              >
                                View Details →
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-center text-xs"
                    onClick={() => {
                      setShowDropdown(false)
                      // Navigate to notifications page if it exists
                    }}
                  >
                    View All Notifications
                  </Button>
                </div>
              )}
            </GlassCard>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell
