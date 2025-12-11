'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Users,
  Search,
  X,
  Calendar,
  GraduationCap,
  DollarSign,
  ClipboardList,
  User,
  Save,
  KeyRound,
  EyeOffIcon,
  Eye,
} from 'lucide-react'
import { ThreeDots } from 'react-loader-spinner'
import { toast, ToastContainer } from 'react-toastify'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClassLevel, setSelectedClassLevel] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [studentDetails, setStudentDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true'
    }
    return false
  })

  const classLevels = [
    'all',
    'Freshman',
    'Sophomore',
    'Junior',
    'Senior',
    'Graduate',
  ]

  const handleShowPassword = (value) => {
    setIsShowPassword(value)
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const url = `/api/admin/students`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setStudents(data.data || [])
      } else {
        console.error('Error fetching students:', data.error)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentDetails = async (studentId) => {
    try {
      setLoadingDetails(true)
      const response = await fetch(`/api/admin/students?id=${studentId}`)
      const data = await response.json()

      console.log('Fetched student details:', data)

      if (data.success) {
        setStudentDetails(data.data)
        setEditStudent({
          fullName: data.data.fullName || '',
          studentId: data.data.studentId || '',
          classLevel: data.data.classLevel || '',
          dateOfBirth: data.data.dateOfBirth
            ? data.data.dateOfBirth.split('T')[0]
            : '',
        })
      } else {
        console.error('Error fetching student details:', data.error)
      }
    } catch (error) {
      console.error('Error fetching student details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleStudentClick = (student) => {
    setSelectedStudent(student)
    setShowDetails(true)
    fetchStudentDetails(student.id)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatMoney = (amount) =>
    Number(amount || 0)
      .toLocaleString('vi-VN')
      .replace(/,/g, '.')

  const handleStudentSave = async () => {
    if (!studentDetails?.userId) {
      alert('Missing user id for this student')
      return
    }
    setSaving(true)
    toast.loading('Saving student details...')
    try {
      const payload = {
        userId: studentDetails.userId,
        role: 'student',
        updates: {
          fullName: editStudent?.fullName || '',
          studentCode: editStudent?.studentId || '',
          classLevel: editStudent?.classLevel || '',
          dateOfBirth: editStudent?.dateOfBirth || null,
        },
      }
      if (newPassword) {
        payload.newPassword = newPassword
      }

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      toast.dismiss()

      const data = await res.json()
      if (!data.success) {
        toast.error(data.error || 'Update failed')
        return
      }
      // Refresh details and list
      toast.success('Student updated successfully')
      setTimeout(async () => {
        await fetchStudentDetails(studentDetails.id)
        await fetchStudents()
        setNewPassword('')
      }, 500)
    } catch (err) {
      console.error(err)
      toast.error('Unexpected error while updating student')
    } finally {
      setSaving(false)
    }
  }

  const handleSearchAndFilter = () => {
    let filtered = [...students]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (student) =>
          student.fullName.toLowerCase().includes(query) ||
          (student.studentId && student.studentId.toLowerCase().includes(query))
      )
    }

    if (selectedClassLevel !== 'all') {
      filtered = filtered.filter(
        (student) => student.classLevel === selectedClassLevel
      )
    }

    setFilteredStudents(filtered)
  }

  useEffect(() => {
    handleSearchAndFilter()
  }, [students, searchQuery, selectedClassLevel])

  useEffect(() => {
    fetchStudents()
  }, [])

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
          <Users className="w-8 h-8" />
          Student Management
        </h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Class Level:</Label>
              <select
                value={selectedClassLevel}
                onChange={(e) => setSelectedClassLevel(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                {classLevels.map((level) => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No students found
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleStudentClick(student)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {student.fullName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>ID: {student.studentId || 'N/A'}</span>
                            <span>•</span>
                            <span>Level: {student.classLevel || 'N/A'}</span>
                            <span>•</span>
                            <span>DOB: {formatDate(student.dateOfBirth)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Details Modal */}
      {showDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {selectedStudent.fullName}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Student ID: {selectedStudent.studentId || 'N/A'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDetails(false)
                  setSelectedStudent(null)
                  setStudentDetails(null)
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-8">
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
              ) : studentDetails ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">
                          Full Name
                        </Label>
                        <Input
                          value={editStudent?.fullName || ''}
                          onChange={(e) =>
                            setEditStudent((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Student ID
                        </Label>
                        <Input
                          value={editStudent?.studentId || ''}
                          onChange={(e) =>
                            setEditStudent((prev) => ({
                              ...prev,
                              studentId: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Class Level
                        </Label>
                        <Input
                          value={editStudent?.classLevel || ''}
                          onChange={(e) =>
                            setEditStudent((prev) => ({
                              ...prev,
                              classLevel: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Date of Birth
                        </Label>
                        <Input
                          type="date"
                          value={editStudent?.dateOfBirth || ''}
                          onChange={(e) =>
                            setEditStudent((prev) => ({
                              ...prev,
                              dateOfBirth: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-2 mb-1">
                          New Password (optional)
                          {isShowPassword ? (
                            <EyeOffIcon
                              className="h-4 w-4 cursor-pointer"
                              onClick={() => handleShowPassword(false)}
                            />
                          ) : (
                            <Eye
                              className="h-4 w-4 cursor-pointer"
                              onClick={() => handleShowPassword(true)}
                            />
                          )}
                        </Label>
                        <Input
                          type={isShowPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter to reset password"
                        />
                      </div>
                      <div className="flex items-end gap-3">
                        <Button
                          onClick={handleStudentSave}
                          disabled={saving}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Enrollments */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Enrolled Classes (
                      {studentDetails.enrollments?.length || 0})
                    </h3>
                    {studentDetails.enrollments &&
                    studentDetails.enrollments.length > 0 ? (
                      <div className="space-y-2">
                        {studentDetails.enrollments.map((enrollment) => (
                          <Card key={enrollment.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {enrollment.className}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {enrollment.subject?.code} -{' '}
                                    {enrollment.subject?.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {enrollment.semester} {enrollment.year}
                                  </p>
                                </div>
                                {enrollment.staff && (
                                  <div className="text-right">
                                    <p className="text-sm font-medium">
                                      {enrollment.staff.fullName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {enrollment.staff.staffId}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No enrollments found
                      </p>
                    )}
                  </div>

                  {/* Fees */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      Fees ({studentDetails.fees?.length || 0})
                    </h3>
                    {studentDetails.fees && studentDetails.fees.length > 0 ? (
                      <div className="space-y-2">
                        {studentDetails.fees.map((fee) => (
                          <Card key={fee.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {formatMoney(fee.amount)} VND
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Due: {formatDate(fee.due_date)}
                                  </p>
                                </div>
                                <div
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    fee.paid
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}
                                >
                                  {fee.paid ? 'Paid' : 'Unpaid'}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No fees found</p>
                    )}
                  </div>

                  {/* Recent Attendance */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recent Attendance (
                      {studentDetails.attendance?.length || 0})
                    </h3>
                    {studentDetails.attendance &&
                    studentDetails.attendance.length > 0 ? (
                      <div className="space-y-2">
                        {studentDetails.attendance.slice(0, 10).map((att) => (
                          <Card key={att.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {formatDate(att.date)}
                                  </p>
                                </div>
                                <div
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    att.status === 'present'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : att.status === 'late'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}
                                >
                                  {att.status?.toUpperCase() || 'N/A'}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No attendance records found
                      </p>
                    )}
                  </div>

                  {/* Exam Scores */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5" />
                      Exam Scores ({studentDetails.scores?.length || 0})
                    </h3>
                    {studentDetails.scores &&
                    studentDetails.scores.length > 0 ? (
                      <div className="space-y-2">
                        {studentDetails.scores.map((score) => (
                          <Card key={score.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {score.exams?.classes?.class_name || 'N/A'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {score.exams?.exam_type?.toUpperCase() ||
                                      'N/A'}{' '}
                                    - {formatDate(score.exams?.exam_date)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold">
                                    {score.score || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No exam scores found
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Failed to load student details
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
