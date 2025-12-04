'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Megaphone, Calendar } from 'lucide-react';
import { ThreeDots } from 'react-loader-spinner';

export default function StaffDashboard() {
  const [staff, setStaff] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/staff/dashboard');
      const data = await response.json();

      if (data.success) {
        setStaff({ name: data.staff?.full_name || 'Staff' });
        setTotalStudents(data.stats?.totalStudents || 0);
        setTotalClasses(data.stats?.totalClasses || 0);
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
    <div className="space-y-6 font-roboto">
      <h1 className="text-3xl font-bold">Welcome, {staff?.name || 'Staff'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-2xl">Students This Semester</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{totalStudents}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span className="text-2xl">Classes This Semester</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{totalClasses}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Megaphone className="w-5 h-5" />
              <span className="text-2xl"> Recent Announcements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-lg">
              <li className="p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Annual Sports Day on 15th July
              </li>
              <li className="p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Parent-Teacher Meeting next Friday
              </li>
              <li className="p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                New Library Books Available
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span className="text-2xl">Upcoming Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-lg">
              <li className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                Mid-term Exams: 20th-25th August
              </li>
              <li className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                Science Fair: 5th September
              </li>
              <li className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                Career Counseling Session: 10th September
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
