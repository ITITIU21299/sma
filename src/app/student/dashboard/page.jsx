"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  CalendarCheck,
  BookOpen,
  DollarSign,
  ClipboardList,
  Calendar,
  Home,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { ThreeDots } from "react-loader-spinner";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [gpa, setGpa] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [unpaidFeesCount, setUnpaidFeesCount] = useState(0);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentScores, setRecentScores] = useState([]);
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
          setTotalClasses(data.totalClasses || 0);
          setUnpaidFeesCount(data.unpaidFeesCount || 0);
          setUpcomingExams(data.upcomingExams || []);
          setRecentScores(data.recentScores || []);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getGpaColor = (gpa) => {
    if (gpa >= 3.5) return "text-green-600 dark:text-green-400";
    if (gpa >= 3.0) return "text-blue-600 dark:text-blue-400";
    if (gpa >= 2.0) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return "text-green-600 dark:text-green-400";
    if (rate >= 75) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

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
    );
  }

  return (
    <div className="space-y-6 font-roboto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="w-8 h-8" />
            Welcome, {student?.name || "Student"}
          </h1>
          <p className="text-muted-foreground mt-2">Your academic overview</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current GPA
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getGpaColor(gpa)}`}>
              {gpa.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of 4.0 scale
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <CalendarCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${getAttendanceColor(
                attendanceRate
              )}`}
            >
              {attendanceRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall attendance
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enrolled Classes
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground mt-1">Total classes</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unpaid Fees
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
              <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                unpaidFeesCount > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {unpaidFeesCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {unpaidFeesCount > 0 ? "Fees pending" : "All fees paid"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        {upcomingExams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{exam.className}</p>
                      <p className="text-sm text-muted-foreground">
                        {exam.examType?.toUpperCase() || "Exam"} •{" "}
                        {formatDate(exam.examDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm font-medium">
                        {formatDate(exam.examDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/student/exam-schedule">
                  <button className="text-sm text-primary hover:underline">
                    View all exams →
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Exam Scores */}
        {recentScores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Exam Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentScores.map((score) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{score.className}</p>
                      <p className="text-sm text-muted-foreground">
                        {score.examType?.toUpperCase() || "Exam"} •{" "}
                        {formatDate(score.examDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          score.score >= 90
                            ? "text-green-600 dark:text-green-400"
                            : score.score >= 75
                            ? "text-blue-600 dark:text-blue-400"
                            : score.score >= 60
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {score.score || "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/student/marks">
                  <button className="text-sm text-primary hover:underline">
                    View all marks →
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/student/schedule">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">View Schedule</span>
                </div>
              </div>
            </Link>
            <Link href="/student/fee">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="font-medium">Fee Information</span>
                </div>
              </div>
            </Link>
            <Link href="/student/marks">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  <span className="font-medium">View Marks</span>
                </div>
              </div>
            </Link>
            <Link href="/student/attendance">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-5 h-5 text-primary" />
                  <span className="font-medium">Attendance</span>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
