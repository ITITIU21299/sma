'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  GraduationCap,
  Search,
  X,
  Calendar,
  Users,
  BookOpen,
  Clock,
  MapPin,
  ClipboardList,
  Briefcase,
} from 'lucide-react'
import { ThreeDots } from 'react-loader-spinner'
import { ToastContainer } from 'react-toastify'

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([])
  const [filteredClasses, setFilteredClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedClass, setSelectedClass] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [classDetails, setClassDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true'
    }
    return false
  })

  const semesters = ['all', 'Fall', 'Spring', 'Summer']
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i)

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const url = `/api/admin/classes`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setClasses(data.data || [])
        setFilteredClasses(data.data || [])
      } else {
        console.error('Error fetching classes:', data.error)
        setClasses([])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchClassDetails = async (classId) => {
    try {
      setLoadingDetails(true)
      const response = await fetch(`/api/admin/classes?id=${classId}`)
      const data = await response.json()

      if (data.success) {
        setClassDetails(data.data)
      } else {
        console.error('Error fetching class details:', data.error)
      }
    } catch (error) {
      console.error('Error fetching class details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem)
    setShowDetails(true)
    fetchClassDetails(classItem.id)
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

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    return timeString
  }

  const getDayName = (dayOfWeek) => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    return days[dayOfWeek - 1] || 'N/A'
  }

  const handleSearchAndFilter = () => {
    let filteredClasses = [...classes]

    if (searchQuery) {
      filteredClasses = filteredClasses.filter((classItem) =>
        classItem.className
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      )
    }

    if (selectedSemester !== 'all') {
      filteredClasses = filteredClasses.filter(
        (classItem) => classItem.semester === selectedSemester
      )
    }

    if (selectedYear) {
      filteredClasses = filteredClasses.filter(
        (classItem) => String(classItem.year) === selectedYear
      )
    }

    setFilteredClasses(filteredClasses)
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    handleSearchAndFilter()
  }, [classes, searchQuery, selectedSemester, selectedYear])

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
          <GraduationCap className="w-8 h-8" />
          Class Management
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
                  placeholder="Search by class name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Semester:</Label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem === 'all' ? 'All Semesters' : sem}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Year:</Label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredClasses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No classes found
              </div>
            ) : (
              filteredClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleClassClick(classItem)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {classItem.className}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {classItem.subject && (
                              <>
                                <span>
                                  {classItem.subject.code} -{' '}
                                  {classItem.subject.name}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            <span>
                              {classItem.semester} {classItem.year}
                            </span>
                            <span>•</span>
                            <span>
                              {classItem.staff?.fullName || 'No Staff'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {classItem.enrollmentCount} students
                            </span>
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

      {/* Class Details Modal */}
      {showDetails && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-[90vw] max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedClass.className}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {selectedClass.subject?.code} - {selectedClass.subject?.name}{' '}
                  • {selectedClass.semester} {selectedClass.year}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDetails(false)
                  setSelectedClass(null)
                  setClassDetails(null)
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-lg">Loading details...</div>
                </div>
              ) : classDetails ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Class Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Class Name
                        </Label>
                        <p className="font-medium">{classDetails.className}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Subject</Label>
                        <p className="font-medium">
                          {classDetails.subject?.code} -{' '}
                          {classDetails.subject?.name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Semester
                        </Label>
                        <p className="font-medium">{classDetails.semester}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Year</Label>
                        <p className="font-medium">{classDetails.year}</p>
                      </div>
                      {classDetails.staff && (
                        <>
                          <div>
                            <Label className="text-muted-foreground flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              Instructor
                            </Label>
                            <p className="font-medium">
                              {classDetails.staff.fullName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {classDetails.staff.staffId} •{' '}
                              {classDetails.staff.department}
                            </p>
                          </div>
                          {classDetails.staff.phone && (
                            <div>
                              <Label className="text-muted-foreground">
                                Phone
                              </Label>
                              <p className="font-medium">
                                {classDetails.staff.phone}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Enrollments */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Enrolled Students ({classDetails.enrollments?.length || 0}
                      )
                    </h3>
                    {classDetails.enrollments &&
                    classDetails.enrollments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {classDetails.enrollments.map((enrollment) => (
                          <Card key={enrollment.id}>
                            <CardContent className="p-3">
                              <p className="font-medium">
                                {enrollment.student?.fullName || 'Unknown'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {enrollment.student?.studentId || 'N/A'} •{' '}
                                {enrollment.student?.classLevel || 'N/A'}
                              </p>
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

                  {/* Timetable */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Schedule ({classDetails.timetable?.length || 0})
                    </h3>
                    {classDetails.timetable &&
                    classDetails.timetable.length > 0 ? (
                      <div className="space-y-2">
                        {classDetails.timetable.map((slot) => (
                          <Card key={slot.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {getDayName(slot.day_of_week)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatTime(slot.start_time)} -{' '}
                                    {formatTime(slot.end_time)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {slot.rooms && (
                                    <p className="text-sm font-medium flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {slot.rooms.room_name}
                                    </p>
                                  )}
                                  {slot.staff && (
                                    <p className="text-xs text-muted-foreground">
                                      {slot.staff.full_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No schedule found</p>
                    )}
                  </div>

                  {/* Exams */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5" />
                      Exams ({classDetails.exams?.length || 0})
                    </h3>
                    {classDetails.exams && classDetails.exams.length > 0 ? (
                      <div className="space-y-2">
                        {classDetails.exams.map((exam) => (
                          <Card key={exam.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {exam.exam_type?.toUpperCase() || 'N/A'}
                                  </p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(exam.exam_date)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No exams found</p>
                    )}
                  </div>

                  {/* Recent Attendance */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recent Attendance ({classDetails.attendance?.length ||
                        0}{' '}
                      records)
                    </h3>
                    {classDetails.attendance &&
                    classDetails.attendance.length > 0 ? (
                      <div className="space-y-2">
                        {classDetails.attendance.slice(0, 10).map((att) => (
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
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Failed to load class details
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
