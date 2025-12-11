'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  Home,
  Clock,
} from 'lucide-react';
import { ThreeDots } from 'react-loader-spinner';
import Link from 'next/link';

export default function StaffDashboard() {
  const [staff, setStaff] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [weeklyTeachingHours, setWeeklyTeachingHours] = useState(0);
  const [latestSalary, setLatestSalary] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/staff/dashboard');
      const data = await response.json();

      if (data.success) {
        setStaff({ name: data.staff?.full_name || 'Staff' });
        setTotalStudents(data.stats?.totalStudents || 0);
        setTotalClasses(data.stats?.totalClasses || 0);
        setWeeklyTeachingHours(data.weeklyTeachingHours || 0);
        setLatestSalary(data.latestSalary);
        setCurrentSemester(data.currentSemester);
      } else {
        console.error('Error fetching dashboard data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatMonthYear = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
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
            Welcome, {staff?.name || 'Staff'}
          </h1>
          {currentSemester && (
            <p className="text-muted-foreground mt-2">
              {currentSemester.semester} {currentSemester.year} Semester
            </p>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Students This Semester
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total enrolled students
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Classes This Semester
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Classes you&apos;re teaching
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Teaching Hours
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weeklyTeachingHours}</div>
            <p className="text-xs text-muted-foreground mt-1">Hours per week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest Salary
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            {latestSalary ? (
              <>
                <div className="text-2xl font-bold">
                  {latestSalary.totalSalary
                    ? `${Number(latestSalary.totalSalary)
                        .toLocaleString('vi-VN')
                        .replace(/,/g, '.')} VND`
                    : latestSalary.baseSalary
                    ? `${Number(latestSalary.baseSalary)
                        .toLocaleString('vi-VN')
                        .replace(/,/g, '.')} VND`
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatMonthYear(latestSalary.monthYear)}
                  {latestSalary.status ? (
                    <span className="ml-2 text-green-600 dark:text-green-400">
                      • Paid
                    </span>
                  ) : (
                    <span className="ml-2 text-red-600 dark:text-red-400">
                      • Pending
                    </span>
                  )}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">
                  N/A
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  No salary records
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/staff/schedule">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">View Schedule</span>
                </div>
              </div>
            </Link>
            <Link href="/staff/salary">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="font-medium">Salary Information</span>
                </div>
              </div>
            </Link>
            <Link href="/staff/attendance">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">Mark Attendance</span>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
