'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, EyeOffIcon, Lock } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true'
    }
    return false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    toast.loading('Changing password...')
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to change password')
        return
      }
      toast.dismiss()
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const [isShowPassword, setIsShowPassword] = useState(false)

  const handleShowPassword = (value) => {
    setIsShowPassword(value)
  }

  useEffect(() => {
    setDarkMode(localStorage.getItem('darkMode') === 'true')
  }, [localStorage.getItem('darkMode')])

  return (
    <div className="space-y-6 font-roboto">
      <h1 className="text-2xl font-bold">Change Password</h1>
      <ToastContainer theme={darkMode ? 'light' : 'dark'} />

      <Card className="pt-4">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="newPassword">New Password</Label>
                {isShowPassword ? (
                  <EyeOffIcon
                    className="ml-2 h-4 w-4 cursor-pointer"
                    onClick={() => handleShowPassword(false)}
                  />
                ) : (
                  <Eye
                    className="ml-2 h-4 w-4 cursor-pointer"
                    onClick={() => handleShowPassword(true)}
                  />
                )}
              </div>
              <Input
                id="newPassword"
                type={isShowPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={isShowPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Change
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
