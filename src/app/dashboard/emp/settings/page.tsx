'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Settings, 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  Shield, 
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  MessageSquare,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Save,
  RefreshCw
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { GlassCard, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"

interface SettingsData {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    sound: boolean
  }
  privacy: {
    showProfile: boolean
    showActivity: boolean
    allowMessages: boolean
  }
  preferences: {
    theme: string
    language: string
    timezone: string
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      sound: true
    },
    privacy: {
      showProfile: true,
      showActivity: false,
      allowMessages: true
    },
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC'
    }
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const { theme, setTheme } = useTheme()
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

    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [router])

  const handleToggle = (section: keyof SettingsData, key: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key as keyof typeof prev[typeof section]]
      }
    }))
  }

  const handleSelectChange = (section: keyof SettingsData, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Save to localStorage (in a real app, you'd save to API)
      localStorage.setItem('userSettings', JSON.stringify(settings))
      
      // Apply theme change immediately
      if (settings.preferences.theme !== theme) {
        setTheme(settings.preferences.theme)
      }

      setSuccess('Settings saved successfully!')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to save settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetToDefaults = () => {
    const defaultSettings: SettingsData = {
      notifications: {
        email: true,
        push: true,
        sms: false,
        sound: true
      },
      privacy: {
        showProfile: true,
        showActivity: false,
        allowMessages: true
      },
      preferences: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC'
      }
    }
    setSettings(defaultSettings)
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
                <Link href="/dashboard/emp" className="flex items-center space-x-1 sm:space-x-2">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
              <div className="flex items-center space-x-2 min-w-0">
                <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                  Settings
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </GlassCard>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Messages */}
          {(success || error) && (
            <GlassCard className="p-4">
              {success && (
                <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 dark:text-green-200">{success}</span>
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-800 dark:text-red-200">{error}</span>
                </div>
              )}
            </GlassCard>
          )}

          {/* Notifications Settings */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Receive attendance updates via email</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('notifications', 'email')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.email ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Get instant notifications on your device</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('notifications', 'push')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.push ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Receive important alerts via SMS</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('notifications', 'sms')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.sms ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  {settings.notifications.sound ? (
                    <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Sound Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Play sounds for notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('notifications', 'sound')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.sound ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.sound ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Privacy Settings */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Privacy & Security
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  {settings.privacy.showProfile ? (
                    <Eye className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Show Profile</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Make your profile visible to colleagues</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('privacy', 'showProfile')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.showProfile ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.showProfile ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Show Activity</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Display your attendance activity</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('privacy', 'showActivity')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy.showActivity ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy.showActivity ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Preferences */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Palette className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Preferences
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleSelectChange('preferences', 'theme', value)}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                        settings.preferences.theme === value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Language
                </label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => handleSelectChange('preferences', 'language', e.target.value)}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Timezone
                </label>
                <select
                  value={settings.preferences.timezone}
                  onChange={(e) => handleSelectChange('preferences', 'timezone', e.target.value)}
                  className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Action Buttons */}
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={resetToDefaults}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset to Defaults</span>
              </Button>

              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Settings</span>
              </Button>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  )
}
