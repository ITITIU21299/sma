'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ThreeDots } from 'react-loader-spinner';
import { ToastContainer, toast } from 'react-toastify';

export default function StaffAttendancePage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [semesterStartDate, setSemesterStartDate] = useState('2025-09-01');
  const [semesterWeek, setSemesterWeek] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [saving, setSaving] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  const getSemesterStartDate = (semester, year) => {
    const y = parseInt(year, 10) || new Date().getFullYear();

    // Normalize semester value (could be '1', 'Fall', etc.)
    const sem = String(semester || '').toLowerCase();

    if (sem === 'fall' || sem === '1') {
      return new Date(y, 8, 1); // September 1
    } else if (sem === 'spring' || sem === '2') {
      return new Date(y, 0, 1); // January 1
    } else if (sem === 'summer' || sem === '3') {
      return new Date(y, 5, 1); // June 1
    }
    return new Date(y, 0, 1); // Fallback: January 1
  };

  const fetchTimetableForClass = async (classId) => {
    setLoadingTimetable(true);
    try {
      const response = await fetch(
        `/api/staff/attendance?classId=${classId}&timetable=true`
      );
      const data = await response.json();

      if (data.success && data.timetable) {
        setTimetableEntries(data.timetable);
      } else {
        setTimetableEntries([]);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setTimetableEntries([]);
    } finally {
      setLoadingTimetable(false);
    }
  };

  const handleSelectClass = async (classId) => {
    const cls = await classes.find((c) => c.id === classId);
    console.log('Selected class:', cls);
    setSelectedClass(cls || null);

    if (cls) {
      const startDate = getSemesterStartDate(cls.semester, cls.year);
      const startDateStr = startDate.toISOString().split('T')[0];
      setSemesterStartDate(startDateStr);
      handleSetSemesterWeek();
      await fetchTimetableForClass(cls.id);
    } else {
      setSemesterStartDate('');
      setTimetableEntries([]);
    }
    setSelectedSection(null); // Reset section when class changes
  };

  const handleSetSemesterWeek = () => {
    // Always show weeks 1-15 for all semesters
    const weeks = [];
    for (let i = 1; i <= 15; i++) {
      weeks.push(i);
    }
    setSemesterWeek(weeks);
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/staff/classes');
      const data = await response.json();

      console.log('Fetched classes:', data);

      if (data.success && data.classes) {
        setClasses(data.classes);
      } else {
        console.error('Error fetching classes:', data.error);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch students when class and section are selected
  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      setStudents([]);
      setAttendance({});
      return;
    }

    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const response = await fetch(
          `/api/staff/attendance?classId=${selectedClass.id}&section=${selectedSection}&semesterStartDate=${semesterStartDate}`
        );
        const data = await response.json();

        if (data.success && data.students) {
          setStudents(data.students);
          // Initialize attendance status from existing records or default to 'present'
          const initialAttendance = {};
          data.students.forEach((student) => {
            // If student already has attendance record, use that status
            const existingRecord = data.attendance?.find(
              (a) => a.student_id === student.student_id
            );
            initialAttendance[student.student_id] =
              existingRecord?.status || 'present';
          });
          setAttendance(initialAttendance);
        } else {
          console.error('Error fetching students:', data.error);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [selectedClass, selectedSection, semesterStartDate]);

  useEffect(() => {
    const darkModeValue = localStorage.getItem('darkMode') === 'true';
    setDarkMode(darkModeValue);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  // Calculate the actual calendar date for a class session in a given week
  // Uses real calendar: semester starts on specific date, week 1 starts from Monday of that week
  const calculateClassDate = (week, dayOfWeek, semesterStartDateStr) => {
    const startDate = new Date(semesterStartDateStr);
    startDate.setHours(0, 0, 0, 0);

    // Find the Monday of the week containing the semester start date
    // JavaScript getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
    const startDayOfWeek = startDate.getDay(); // 0-6, where 0=Sunday, 1=Monday
    // Calculate days to subtract to get to Monday (0=Monday in our calculation)
    // If Sunday (0), subtract 6 days; if Monday (1), subtract 0 days; etc.
    const daysToMonday = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    const semesterMonday = new Date(startDate);
    semesterMonday.setDate(startDate.getDate() - daysToMonday);
    semesterMonday.setHours(0, 0, 0, 0);

    // Calculate the Monday of the target week (week 1 = semester Monday)
    const weekMonday = new Date(semesterMonday);
    weekMonday.setDate(semesterMonday.getDate() + (week - 1) * 7);

    // Calculate the date for the specific day_of_week
    // dayOfWeek: 1=Monday, 2=Tuesday, ..., 6=Saturday
    const classDate = new Date(weekMonday);
    classDate.setDate(weekMonday.getDate() + (dayOfWeek - 1));

    return classDate.toISOString().split('T')[0];
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedSection) {
      toast.error('Please select a class and week before saving attendance.');
      return;
    }

    // Get day_of_week from timetable entries
    if (timetableEntries.length === 0) {
      toast.error(
        'No timetable information found for this class. Please ensure the class has a timetable entry.'
      );
      return;
    }

    // Use the first timetable entry's day_of_week (assuming a class meets on the same day)
    // If a class has multiple days, we might need to handle that differently
    const dayOfWeek = timetableEntries[0].day_of_week;

    if (!dayOfWeek || dayOfWeek < 1 || dayOfWeek > 6) {
      toast.error(
        'Invalid timetable day_of_week. Must be between 1 (Monday) and 6 (Saturday).'
      );
      return;
    }

    setSaving(true);
    try {
      // Calculate the actual calendar date based on week, day_of_week, and semester start
      const classDate = calculateClassDate(
        selectedSection,
        dayOfWeek,
        semesterStartDate
      );

      const bulkAttendance = Object.entries(attendance).map(
        ([student_id, status]) => ({
          student_id,
          status,
        })
      );

      const response = await fetch('/api/staff/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass.id,
          date: classDate,
          section: selectedSection,
          semesterStartDate: semesterStartDate,
          bulkAttendance,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Attendance saved successfully!');
        // Refresh students to show updated attendance
        // Trigger a re-fetch by updating a dependency
        const response = await fetch(
          `/api/staff/attendance?classId=${selectedClass.id}&section=${selectedSection}&semesterStartDate=${semesterStartDate}`
        );
        const refreshData = await response.json();
        if (refreshData.success && refreshData.students) {
          setStudents(refreshData.students);
          const initialAttendance = {};
          refreshData.students.forEach((student) => {
            const existingRecord = refreshData.attendance?.find(
              (a) => a.student_id === student.student_id
            );
            initialAttendance[student.student_id] =
              existingRecord?.status || 'present';
          });
          setAttendance(initialAttendance);
        }
      } else {
        toast.error(`Error saving attendance: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error(`Error saving attendance: ${error}`);
    } finally {
      setSaving(false);
    }
  };

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
    );
  }

  return (
    <div className="font-roboto space-y-4">
      <h1 className="text-2xl font-bold">Manage Attendance</h1>
      <ToastContainer theme={darkMode ? 'light' : 'dark'} />

      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Select Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="classSelect" className="text-sm">
                Class
              </Label>
              <select
                id="classSelect"
                value={selectedClass?.id || ''}
                onChange={(e) => {
                  handleSelectClass(e.target.value);
                }}
                className="w-full px-3 py-2 border rounded-md bg-background cursor-pointer text-sm"
              >
                <option value="">-- Select a class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name} ({cls.semester}/{cls.year})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Selection */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Select Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-2">
              {semesterWeek.map((section) => (
                <Button
                  key={section}
                  variant={selectedSection === section ? 'default' : 'outline'}
                  onClick={() => setSelectedSection(section)}
                  className="w-full cursor-pointer"
                >
                  <span className="text-sm">Week {section}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students and Attendance */}
      {selectedClass && selectedSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-semibold">
              <span>
                Attendance for {selectedClass.class_name} - Week{' '}
                {selectedSection}
              </span>
              <Button
                onClick={handleSaveAttendance}
                disabled={saving || loadingStudents}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <div className="text-center py-8">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students enrolled in this class
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => {
                  const studentStatus =
                    attendance[student.student_id] || 'present';
                  return (
                    <Card
                      key={student.student_id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(studentStatus)}
                            <div>
                              <p className="font-semibold">
                                {student.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Student ID:{' '}
                                {student.student_id_text ||
                                  student.student_id?.slice(0, 8) ||
                                  'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                                studentStatus === 'present'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : studentStatus === 'absent'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}
                            >
                              {studentStatus}
                            </span>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant={
                                  studentStatus === 'present'
                                    ? 'default'
                                    : 'outline'
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    student.student_id,
                                    'present'
                                  )
                                }
                              >
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  studentStatus === 'absent'
                                    ? 'default'
                                    : 'outline'
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    student.student_id,
                                    'absent'
                                  )
                                }
                              >
                                Absent
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  studentStatus === 'late'
                                    ? 'default'
                                    : 'outline'
                                }
                                onClick={() =>
                                  handleStatusChange(student.student_id, 'late')
                                }
                              >
                                Late
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedClass && !selectedSection && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Please select a week to manage attendance
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Please select a class to manage attendance
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
