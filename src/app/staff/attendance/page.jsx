"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function StaffAttendancePage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [semesterStartDate, setSemesterStartDate] = useState("2025-09-01");
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/staff/classes");
        const data = await response.json();

        if (data.success && data.classes) {
          setClasses(data.classes);
        } else {
          console.error("Error fetching classes:", data.error);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch students when class and section are selected
  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      setStudents([]);
      setAttendance({});
      return;
    }

    const fetchStudents = async () => {
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
            initialAttendance[student.student_id] = existingRecord?.status || "present";
          });
          setAttendance(initialAttendance);
        } else {
          console.error("Error fetching students:", data.error);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedSection, semesterStartDate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "late":
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

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedSection) {
      alert("Please select a class and section");
      return;
    }

    setSaving(true);
    try {
      // Calculate the date for this section (first day of the section)
      const startDate = new Date(semesterStartDate);
      const sectionStartDate = new Date(startDate);
      sectionStartDate.setDate(startDate.getDate() + (selectedSection - 1) * 7);
      
      // Use the first day of the section as the date
      const dateStr = sectionStartDate.toISOString().split("T")[0];

      const bulkAttendance = Object.entries(attendance).map(
        ([student_id, status]) => ({
          student_id,
          status,
        })
      );

      const response = await fetch("/api/staff/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          classId: selectedClass.id,
          date: dateStr,
          section: selectedSection,
          semesterStartDate: semesterStartDate,
          bulkAttendance,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Attendance saved successfully!");
      } else {
        alert(data.error || "Failed to save attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Attendance</h1>

      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="classSelect">Class</Label>
              <select
                id="classSelect"
                value={selectedClass?.id || ""}
                onChange={(e) => {
                  const classId = e.target.value;
                  const cls = classes.find((c) => c.id === classId);
                  setSelectedClass(cls || null);
                  setSelectedSection(null); // Reset section when class changes
                }}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">-- Select a class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name} - {cls.subject_name} ({cls.semester}/{cls.year})
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
            <CardTitle>Select Section (Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((section) => (
                <Button
                  key={section}
                  variant={selectedSection === section ? "default" : "outline"}
                  onClick={() => setSelectedSection(section)}
                  className="w-full"
                >
                  Section {section}
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
            <CardTitle className="flex items-center justify-between">
              <span>
                Attendance for {selectedClass.class_name} - Section {selectedSection}
              </span>
              <Button
                onClick={handleSaveAttendance}
                disabled={saving || loadingStudents}
              >
                {saving ? "Saving..." : "Save Attendance"}
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
                  const studentStatus = attendance[student.student_id] || "present";
                  return (
                    <Card key={student.student_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(studentStatus)}
                            <div>
                              <p className="font-semibold">{student.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Student ID: {student.student_id_text || student.student_id?.slice(0, 8) || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                                studentStatus === "present"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : studentStatus === "absent"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                            >
                              {studentStatus}
                            </span>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant={
                                  studentStatus === "present" ? "default" : "outline"
                                }
                                onClick={() =>
                                  handleStatusChange(student.student_id, "present")
                                }
                              >
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  studentStatus === "absent" ? "default" : "outline"
                                }
                                onClick={() =>
                                  handleStatusChange(student.student_id, "absent")
                                }
                              >
                                Absent
                              </Button>
                              <Button
                                size="sm"
                                variant={
                                  studentStatus === "late" ? "default" : "outline"
                                }
                                onClick={() =>
                                  handleStatusChange(student.student_id, "late")
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
              Please select a section (week) to manage attendance
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
