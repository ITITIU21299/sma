'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  MessageSquare,
  DollarSign,
  Briefcase,
  Home,
  ArrowRight,
} from 'lucide-react'
import { ThreeDots } from 'react-loader-spinner'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        console.error('Error fetching dashboard data:', data.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ThreeDots
          visible={true}
          height="100"
          width="100"
          color="#4fa94d"
          radius="9"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      link: '/admin/students',
    },
    {
      title: 'Total Staff',
      value: stats?.totalStaff || 0,
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      link: '/admin/staff',
    },
    {
      title: 'Total Classes',
      value: stats?.totalClasses || 0,
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      link: '/admin/classes',
    },
    {
      title: 'Total Subjects',
      value: stats?.totalSubjects || 0,
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
    {
      title: 'Total Rooms',
      value: stats?.totalRooms || 0,
      icon: Building2,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900',
    },
    {
      title: 'Pending Feedback',
      value: stats?.pendingFeedback || 0,
      icon: MessageSquare,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      link: '/admin/feedback?status=pending',
    },
    {
      title: 'Unpaid Fees',
      value: stats?.unpaidFees || 0,
      icon: DollarSign,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900',
    },
    {
      title: 'Unpaid Salaries',
      value: stats?.unpaidSalaries || 0,
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900',
    },
  ]

  return (
    <div className="space-y-6 font-roboto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="w-8 h-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome to the admin panel
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          const CardComponent = card.link ? Link : 'div'
          const cardProps = card.link ? { href: card.link } : {}

          return (
            <CardComponent
              key={index}
              {...cardProps}
              className={
                card.link
                  ? 'cursor-pointer hover:shadow-lg transition-shadow'
                  : ''
              }
            >
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.value}</div>
                  {card.link && (
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <span>View details</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardComponent>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/students">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Students
              </Button>
            </Link>
            <Link href="/admin/staff">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="w-4 h-4 mr-2" />
                Manage Staff
              </Button>
            </Link>
            <Link href="/admin/classes">
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="w-4 h-4 mr-2" />
                Manage Classes
              </Button>
            </Link>
            <Link href="/admin/feedback">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                View Feedback
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
