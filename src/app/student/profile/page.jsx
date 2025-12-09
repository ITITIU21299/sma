'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from 'lucide-react'
import { ThreeDots } from 'react-loader-spinner'

export default function StudentProfilePage() {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/student/profile')
        const data = await response.json()

        if (data.success && data.student) {
          setStudent({
            studentId: data.student.student_id || data.student.id,
            name: data.student.full_name,
            email: data.student.email,
            dateOfBirth: data.student.date_of_birth || '',
            classLevel: data.student.class_level || '',
          })
        } else {
          console.error('Error fetching profile:', data.error)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center">
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span className="text-lg font-semibold">Student Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Student ID</Label>
              <Input value={student?.studentId || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Name</Label>
              <Input value={student?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Email</Label>
              <Input value={student?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Date of Birth</Label>
              <Input value={student?.dateOfBirth || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Class Level</Label>
              <Input value={student?.classLevel || ''} disabled />
            </div>
          </div>
          <div className="mt-6">
            <Button asChild className="text-sm">
              <a href="/student/change-password">Change Password</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
