'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from 'lucide-react'
import { ThreeDots } from 'react-loader-spinner'

export default function StaffProfilePage() {
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/staff/profile')
        const data = await response.json()

        if (data.success && data.staff) {
          setStaff({
            staffId: data.staff.staff_id || data.staff.id,
            name: data.staff.full_name,
            email: data.staff.email,
            phone: data.staff.phone || '',
            department: data.staff.department || '',
            hireDate: data.staff.hire_date || '',
            createdAt: data.staff.created_at || '',
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
    <div className="space-y-6 font-roboto">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Staff Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Staff ID</Label>
              <Input value={staff?.staffId || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={staff?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={staff?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={staff?.phone || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={staff?.department || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Hire Date</Label>
              <Input value={staff?.hireDate || ''} disabled />
            </div>
          </div>
          <div className="mt-6">
            <Button asChild>
              <a href="/staff/change-password">Change Password</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
