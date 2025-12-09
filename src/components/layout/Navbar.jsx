'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Home,
  Calendar,
  CalendarCheck,
  DollarSign,
  LogOut,
  User,
  MessageSquare,
  ClipboardList,
  Sun,
  Users,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import logo from '@/../public/logo.png';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Navbar({ userRole, userName }) {
  const pathname = usePathname();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    // Sync DOM with dark mode state
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => pathname === path;

  const studentNavItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: Home },
    { href: '/student/fee', label: 'Fee Information', icon: DollarSign },
    {
      href: '/student/exam-schedule',
      label: 'Exam Schedule',
      icon: CalendarCheck,
    },
    { href: '/student/schedule', label: 'Room Schedule', icon: Calendar },
    { href: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
    { href: '/student/marks', label: 'Marks', icon: ClipboardList },
    { href: '/student/feedback', label: 'Feedback', icon: MessageSquare },
  ];

  const staffNavItems = [
    { href: '/staff/dashboard', label: 'Dashboard', icon: Home },
    { href: '/staff/salary', label: 'Salary', icon: DollarSign },
    { href: '/staff/schedule', label: 'Schedule', icon: Calendar },
    {
      href: '/staff/attendance',
      label: 'Attendance',
      icon: CalendarCheck,
    },
    //{ href: "/staff/assign-room", label: "Assign Room", icon: ClipboardList },
  ];

  const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/assign-room', label: 'Assign Room', icon: ClipboardList },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/staff', label: 'Staff', icon: Briefcase },
    { href: '/admin/classes', label: 'Classes', icon: GraduationCap },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  ];

  const navItems =
    userRole === 'student'
      ? studentNavItems
      : userRole === 'admin'
      ? adminNavItems
      : staffNavItems;
  const profilePath =
    userRole === 'student'
      ? '/student/profile'
      : userRole === 'admin'
      ? '/admin/profile'
      : '/staff/profile';

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex space-x-2 items-center">
            <Image
              src={logo}
              alt="School Management System Logo"
              width={45}
              height={45}
              className="select-none pointer-events-none"
            />
            <Link
              href={
                userRole === 'student'
                  ? '/student/dashboard'
                  : userRole === 'admin'
                  ? '/admin/dashboard'
                  : '/staff/dashboard'
              }
              className="text-xl font-bold font-montserrat"
            >
              School Management System
            </Link>
          </div>
          <div className="flex items-center space-x-4 font-medium">
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-foreground/20'
                        : 'hover:bg-primary-foreground/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-montserrat">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Sun className="w-4 h-4" />
                {darkMode ? (
                  <span className="hidden md:inline ml-2 font-montserrat text-base">
                    Light
                  </span>
                ) : (
                  <span className="hidden md:inline ml-2 font-montserrat text-base">
                    Dark
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-2 rounded-md transition-colors ${
                  isActive(profilePath)
                    ? 'bg-primary-foreground/20'
                    : 'hover:bg-primary-foreground/10'
                }`}
              >
                <Link
                  className="flex items-center space-x-1"
                  href={profilePath}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline font-montserrat text-base">
                    Profile
                  </span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline ml-2 font-montserrat text-base">
                  Logout
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
