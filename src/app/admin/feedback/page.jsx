'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Filter,
  ArrowUpDown,
  X,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'
import { ThreeDots } from 'react-loader-spinner'
import { toast, ToastContainer } from 'react-toastify'

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState([])
  const [filteredFeedback, setFilteredFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [sortBy, setSortBy] = useState('date_desc')
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true'
    }
    return false
  })

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'class', label: 'Class' },
    { value: 'facility', label: 'Facility' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'other', label: 'Other' },
  ]

  const sortOptions = [
    { value: 'date_desc', label: 'Date (Newest First)' },
    { value: 'date_asc', label: 'Date (Oldest First)' },
    { value: 'high', label: 'Priority: High' },
    { value: 'medium', label: 'Priority: Medium' },
    { value: 'low', label: 'Priority: Low' },
  ]

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
  ]

  const priorityOrder = { high: 3, medium: 2, low: 1 }

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const url = `/api/admin/feedback`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setFeedback(data.data || [])
      } else {
        console.error('Error fetching feedback:', data.error)
        setFeedback([])
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
      setFeedback([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    let filteredList = [...feedback]

    switch (sortBy) {
      case 'date_desc':
        filteredList.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        break
      case 'date_asc':
        filteredList.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )
        break
      case 'high':
        filteredList.sort(
          (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
        )
        break
      case 'medium':
        filteredList.sort((a, b) => {
          if (a.priority === 'medium' && b.priority !== 'medium') return -1
          if (b.priority === 'medium' && a.priority !== 'medium') return 1
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
        break
      case 'low':
        filteredList.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        )
        break
      default:
        break
    }

    if (selectedCategory !== 'all') {
      filteredList = filteredList.filter(
        (item) => item.category === selectedCategory
      )
    }

    if (selectedStatus !== 'all') {
      filteredList = filteredList.filter(
        (item) => item.status === selectedStatus
      )
    }

    setFilteredFeedback(filteredList)
  }

  const updatePriority = async (feedbackId, priority) => {
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, priority }),
      })

      const data = await response.json()
      if (data.success) {
        // Update local state
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === feedbackId ? { ...item, priority } : item
          )
        )
        if (selectedFeedback?.id === feedbackId) {
          setSelectedFeedback({ ...selectedFeedback, priority })
        }
      } else {
        console.error('Error updating priority:', data.error)
      }
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const updateStatus = async (feedbackId, newStatus) => {
    toast.loading('Updating status...')
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, status: newStatus }),
      })

      const data = await response.json()
      toast.dismiss()
      if (data.success) {
        toast.success('Status updated successfully')
        setTimeout(() => {
          // Update local state
          setFeedback((prev) =>
            prev.map((item) =>
              item.id === feedbackId ? { ...item, status: newStatus } : item
            )
          )
          if (selectedFeedback?.id === feedbackId) {
            setSelectedFeedback({ ...selectedFeedback, status: newStatus })
          }
          // If status filter is active and item no longer matches, refetch
          if (selectedStatus !== 'all' && newStatus !== selectedStatus) {
            fetchFeedback()
          }
        }, 500)
      } else {
        console.error('Error updating status:', data.error)
        toast.error(data.error || 'Error updating status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Unexpected error while updating status')
    }
  }

  const toggleStatus = () => {
    if (!selectedFeedback) return
    const newStatus =
      selectedFeedback.status === 'pending' ? 'resolved' : 'pending'
    updateStatus(selectedFeedback.id, newStatus)
  }

  const handleFeedbackClick = (item) => {
    setSelectedFeedback(item)
    setShowPopup(true)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryLabel = (category) => {
    return categories.find((c) => c.value === category)?.label || category
  }

  useEffect(() => {
    fetchFeedback()
  }, [])

  useEffect(() => {
    handleFilter()
  }, [feedback, sortBy, selectedCategory, selectedStatus])

  useEffect(() => {
    setDarkMode(localStorage.getItem('darkMode') === 'true')
  }, [localStorage.getItem('darkMode')])

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

  return (
    <div className="space-y-6 font-roboto">
      <ToastContainer theme={darkMode ? 'light' : 'dark'} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-8 h-8" />
          Feedback Management
        </h1>
      </div>

      {/* Filters and Sort */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredFeedback.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No feedback found
              </div>
            ) : (
              filteredFeedback.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleFeedbackClick(item)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-lg">
                          {item.title || 'No Title'}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            item.priority
                          )}`}
                        >
                          {item.priority.toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {item.isAnonymous
                            ? 'Anonymous'
                            : item.student
                            ? item.student.fullName
                            : 'Unknown Student'}
                        </span>
                        <span>•</span>
                        <span>{formatDate(item.createdAt)}</span>
                        <span>•</span>
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </div>
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant={
                          item.priority === 'high' ? 'default' : 'outline'
                        }
                        onClick={() => updatePriority(item.id, 'high')}
                        className="text-xs"
                      >
                        High
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          item.priority === 'medium' ? 'default' : 'outline'
                        }
                        onClick={() => updatePriority(item.id, 'medium')}
                        className="text-xs"
                      >
                        Med
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          item.priority === 'low' ? 'default' : 'outline'
                        }
                        onClick={() => updatePriority(item.id, 'low')}
                        className="text-xs"
                      >
                        Low
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Popup Modal */}
      {showPopup && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-[80vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">
                    {selectedFeedback.title || 'No Title'}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                      selectedFeedback.priority
                    )}`}
                  >
                    {selectedFeedback.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{getCategoryLabel(selectedFeedback.category)}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedFeedback.status}</span>
                  <span>•</span>
                  <span>{formatDate(selectedFeedback.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={
                      selectedFeedback.priority === 'high'
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => updatePriority(selectedFeedback.id, 'high')}
                  >
                    High
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      selectedFeedback.priority === 'medium'
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      updatePriority(selectedFeedback.id, 'medium')
                    }
                  >
                    Med
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      selectedFeedback.priority === 'low'
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => updatePriority(selectedFeedback.id, 'low')}
                  >
                    Low
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPopup(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Student
                  </h3>
                  <p className="text-base">
                    {selectedFeedback.isAnonymous
                      ? 'Anonymous'
                      : selectedFeedback.student
                      ? `${selectedFeedback.student.fullName} (${selectedFeedback.student.studentId})`
                      : 'Unknown Student'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Message
                  </h3>
                  <p className="text-base whitespace-pre-wrap">
                    {selectedFeedback.message}
                  </p>
                </div>
                {selectedFeedback.updatedAt !== selectedFeedback.createdAt && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Last Updated
                    </h3>
                    <p className="text-base">
                      {formatDate(selectedFeedback.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Status Toggle */}
            <div className="p-6 border-t flex justify-end">
              <Button
                onClick={toggleStatus}
                variant={
                  selectedFeedback.status === 'resolved' ? 'default' : 'outline'
                }
                className="min-w-[120px]"
              >
                {selectedFeedback.status === 'pending'
                  ? 'Mark as Resolved'
                  : 'Mark as Pending'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
