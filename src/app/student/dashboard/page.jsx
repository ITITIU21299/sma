"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, CalendarCheck } from "lucide-react";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [gpa, setGpa] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch student data
    const fetchData = async () => {
      try {
        const response = await fetch("/api/student/dashboard");
        const data = await response.json();

        if (data.success) {
          setStudent({ name: data.name || "Student" });
          setGpa(parseFloat(data.gpa) || 0);
          setAttendanceRate(parseFloat(data.attendanceRate) || 0);
        } else {
          console.error("Error fetching dashboard data:", data.error);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {student?.name || "Student"}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>Current GPA</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{gpa.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarCheck className="w-5 h-5" />
              <span>Attendance Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{attendanceRate.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Annual Sports Day on 15th July
              </li>
              <li className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Parent-Teacher Meeting next Friday
              </li>
              <li className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                New Library Books Available
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Mid-term Exams: 20th-25th August
              </li>
              <li className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Science Fair: 5th September
              </li>
              <li className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Career Counseling Session: 10th September
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

