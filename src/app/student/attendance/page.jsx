'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { ThreeDots } from 'react-loader-spinner'

export default function StudentAttendancePage() {
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [attendanceByWeek, setAttendanceByWeek] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [semesterStartDate, setSemesterStartDate] = useState('2025-09-01')

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/student/attendance')
        const data = await response.json()

        if (data.success && data.classes) {
          setClasses(data.classes)
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

    fetchClasses()
  }, [])

  useEffect(() => {
    if (!selectedClassId) {
      setAttendanceByWeek({})
      return
    }

    const fetchAttendance = async () => {
      try {
        setLoadingAttendance(true)
        const response = await fetch(
          `/api/student/attendance?classId=${selectedClassId}`
        )
        const data = await response.json()

        if (data.success && data.data) {
          setAttendanceByWeek(data.data)
        } else {
          console.error('Error fetching attendance:', data.error)
          setAttendanceByWeek({})
        }
      } catch (error) {
        console.error('Error fetching attendance:', error)
        setAttendanceByWeek({})
      } finally {
        setLoadingAttendance(false)
      }
    }

    fetchAttendance()
  }, [selectedClassId])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return ''
    }
  }

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

  const selectedClass = classes.find((c) => c.class_id === selectedClassId)

  return (
    <div className="space-y-6 font-roboto">
      <h1 className="text-2xl font-bold">Attendance</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Select Class</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class-select" className="text-sm">
              Class
            </Label>
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="">-- Select a class --</option>
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name} ({cls.semester}/{cls.year})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {selectedClassId && (
        <div className="space-y-4">
          {loadingAttendance ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
                (section) => {
                  const sectionData = attendanceByWeek[section] || {
                    status: null,
                    records: [],
                  }
                  const status = sectionData.status
                  return (
                    <Card
                      key={section}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Week {section}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {status === null ? (
                          <p className="text-sm text-muted-foreground">
                            No attendance recorded
                          </p>
                        ) : (
                          <div className="flex flex-col items-center space-y-2">
                            {getStatusIcon(status)}
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
