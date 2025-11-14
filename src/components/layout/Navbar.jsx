'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Home,
  Calendar,
  CalendarCheck,
  DollarSign,
  Users,
  Settings,
  LogOut,
  User,
  MessageSquare,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navbar({ userRole, userName }) {
  const pathname = usePathname()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Load dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path) => pathname === path

  const studentNavItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: Home },
    { href: '/student/fee', label: 'Fee Information', icon: DollarSign },
    {
      href: '/student/exam-schedule',
      label: 'Exam Schedule',
      icon: CalendarCheck,
    },
    { href: '/student/schedule', label: 'Room Schedule', icon: Calendar },
    { href: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
    { href: '/student/feedback', label: 'Feedback', icon: MessageSquare },
  ]

  const staffNavItems = [
    { href: '/staff/dashboard', label: 'Dashboard', icon: Home },
    { href: '/staff/salary', label: 'Salary Information', icon: DollarSign },
    { href: '/staff/schedule', label: 'Schedule', icon: Calendar },
    {
      href: '/staff/attendance',
      label: 'Manage Attendance',
      icon: CalendarCheck,
    },
    { href: '/staff/assign-room', label: 'Assign Room', icon: ClipboardList },
  ]

  const navItems = userRole === 'student' ? studentNavItems : staffNavItems
  const profilePath =
    userRole === 'student' ? '/student/profile' : '/staff/profile'

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href={
              userRole === 'student' ? '/student/dashboard' : '/staff/dashboard'
            }
            className="text-xl font-bold font-montserrat"
          >
            School Management System
          </Link>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-foreground/20'
                        : 'hover:bg-primary-foreground/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-montserrat">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Link
                href={profilePath}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  isActive(profilePath)
                    ? 'bg-primary-foreground/20'
                    : 'hover:bg-primary-foreground/10'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline font-montserrat">
                  Profile
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline ml-2 font-montserrat">
                  Logout
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
