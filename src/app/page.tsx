import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  QrCode, 
  Smartphone, 
  BarChart3, 
  Users, 
  Bell, 
  FileText,
  Sparkles,
  Shield,
  Zap,
  Clock
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-float animation-delay-4000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-6000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10">
        <GlassCard className="mx-4 mt-4 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AttendanceSystem
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </GlassCard>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-sm font-medium mb-8">
            <Zap className="h-4 w-4 mr-2" />
            Next-Generation Workforce Management
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Modern Attendance
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your workforce management with cutting-edge QR codes, NFC technology, 
            and real-time analytics. Built for the modern workplace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-4">
              <Link href="/register">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-4">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {[
              { label: "Active Users", value: "10K+" },
              { label: "Companies", value: "500+" },
              { label: "Attendance Records", value: "1M+" },
              { label: "Uptime", value: "99.9%" }
            ].map((stat, index) => (
              <GlassCard key={index} className="p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need for
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> attendance tracking</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive features designed for modern workplaces with cutting-edge technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: QrCode,
              title: "QR Code Scanning",
              description: "Lightning-fast attendance marking with dynamic QR codes and advanced security features.",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: Smartphone,
              title: "NFC/RFID Support",
              description: "Instant tap-to-mark attendance with NFC cards and RFID tags for seamless experience.",
              gradient: "from-green-500 to-emerald-500"
            },
            {
              icon: BarChart3,
              title: "Real-time Analytics",
              description: "Comprehensive dashboards with attendance trends, insights, and predictive analytics.",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              icon: Users,
              title: "Employee Management",
              description: "Centralized employee management with roles, departments, and approval workflows.",
              gradient: "from-indigo-500 to-blue-500"
            },
            {
              icon: Bell,
              title: "Smart Notifications",
              description: "Instant push notifications for check-ins, check-outs, and important updates.",
              gradient: "from-yellow-500 to-orange-500"
            },
            {
              icon: FileText,
              title: "Advanced Reports",
              description: "Generate detailed reports in Excel and PDF formats with custom filters and insights.",
              gradient: "from-red-500 to-pink-500"
            }
          ].map((feature, index) => (
            <GlassCard key={index} className="p-8 hover:scale-105 transition-all duration-300 group">
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="p-12 text-center">
            <Shield className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to modernize your attendance system?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of companies already using our platform to streamline their workforce management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-4">
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-4">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AttendanceSystem
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Modern attendance management for the digital workplace
              </p>
              <div className="flex justify-center space-x-6">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </footer>

    </div>
  )
}