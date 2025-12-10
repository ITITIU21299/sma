'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send, AlertCircle } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'

export default function StudentFeedbackPage() {
  const [category, setCategory] = useState('other')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true'
    }
    return false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    toast.loading('Submitting feedback...')

    try {
      const response = await fetch('/api/student/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title: title.trim() || null,
          message: message.trim(),
          isAnonymous,
        }),
      })

      const data = await response.json()
      toast.dismiss()
      if (data.success) {
        setSubmitted(true)
        setCategory('other')
        setTitle('')
        setMessage('')
        setIsAnonymous(false)
        setTimeout(() => setSubmitted(false), 5000)
        toast.success('Feedback submitted successfully!')
      } else {
        setError(data.error || 'Failed to submit feedback. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setError('An error occurred. Please try again.')
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setDarkMode(localStorage.getItem('darkMode') === 'true')
  }, [localStorage.getItem('darkMode')])

  return (
    <div className="space-y-6 font-roboto">
      <h1 className="text-2xl font-bold">Feedback</h1>
      <ToastContainer theme={darkMode ? 'light' : 'dark'} />

      <Card className="pt-4">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm">
                Category
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="teacher">Teacher</option>
                <option value="class">Class</option>
                <option value="facility">Facility</option>
                <option value="suggestion">Suggestion</option>
                <option value="complaint">Complaint</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">
                Title (Optional)
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a brief title for your feedback"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm">
                Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder="Enter your feedback message"
                className="resize-none text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="isAnonymous" className="cursor-pointer text-sm">
                Submit anonymously
              </Label>
            </div>
            <Button type="submit" className="w-full text-sm" disabled={loading}>
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
