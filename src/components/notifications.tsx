'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    setMounted(true)
    fetchNotifications()
  }, [userRole])

  // Calculate position when dropdown opens
  useEffect(() => {
    if (showDropdown && buttonRef.current && mounted) {
      const updatePosition = () => {
        const rect = buttonRef.current!.getBoundingClientRect()
        const dropdownWidth = 320
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        // Calculate horizontal position
        let left = rect.right - dropdownWidth
        if (left < 16) {
          left = 16
        } else if (left + dropdownWidth > viewportWidth - 16) {
          left = viewportWidth - dropdownWidth - 16
        }
        
        // Calculate vertical position
        let top = rect.bottom + 8
        const dropdownHeight = 400 // Approximate max height
        if (top + dropdownHeight > viewportHeight - 16) {
          top = rect.top - dropdownHeight - 8
        }
        
        setDropdownPosition({
          top: top + window.scrollY,
          left: left + window.scrollX,
          width: dropdownWidth
        })
      }
      
      updatePosition()
      
      // Update position on scroll/resize
      const handleUpdate = () => updatePosition()
      window.addEventListener('scroll', handleUpdate)
      window.addEventListener('resize', handleUpdate)
      
      return () => {
        window.removeEventListener('scroll', handleUpdate)
        window.removeEventListener('resize', handleUpdate)
      }
    }
  }, [showDropdown, mounted])

  // Close dropdown when pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDropdown) {
        setShowDropdown(false)
      }
    }
    
    if (showDropdown) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showDropdown])

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
    <>
      <div className="relative">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-1.5 sm:p-2"
          title="Notifications"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center min-w-[1rem] sm:min-w-[1.25rem]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Floating Dropdown Portal */}
      {showDropdown && mounted && typeof window !== 'undefined' && 
        createPortal(
          <div className="fixed inset-0 z-[999999]">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/10 backdrop-blur-sm" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Floating Dropdown */}
            <div 
              className="absolute bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                maxHeight: '80vh'
              }}
            >
              {/* Arrow indicator */}
              <div 
                className="absolute w-4 h-4 bg-white dark:bg-gray-900 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45"
                style={{
                  top: '-8px',
                  right: '24px'
                }}
              ></div>
              
              {/* Notification Content */}
              <div className="relative z-10">
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs flex-shrink-0 ml-2"
                    >
                      <span className="hidden sm:inline">Mark all read</span>
                      <span className="sm:hidden">Mark all</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-64 sm:max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center">
                    <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                            {getIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0 pr-2">
                                <p className={`text-sm font-medium truncate ${
                                  !notification.read 
                                    ? 'text-gray-900 dark:text-white' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 sm:mt-1">
                                  {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                                    title="Mark as read"
                                  >
                                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-gray-400 hover:text-red-500"
                                  title="Delete notification"
                                >
                                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
                                className="mt-1 sm:mt-2 h-5 sm:h-6 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-0"
                              >
                                <span className="hidden sm:inline">View Details →</span>
                                <span className="sm:hidden">View →</span>
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
                <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-center text-xs h-7 sm:h-8"
                    onClick={() => {
                      setShowDropdown(false)
                      // Navigate to notifications page if it exists
                    }}
                  >
                    <span className="hidden sm:inline">View All Notifications</span>
                    <span className="sm:hidden">View All</span>
                  </Button>
                </div>
              )}
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </>
  )
}

export default NotificationBell
