"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

export default function StudentProfilePage() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch("/api/student/profile");
        // const data = await response.json();
        
        // Placeholder data
        setStudent({
          studentId: "S001",
          name: "Student Name",
          email: "student@example.com",
          dateOfBirth: "2000-01-01",
          gender: "Male",
          classId: "Class A",
          academicYear: "2024",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Student Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Student ID</Label>
              <Input value={student?.studentId || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={student?.name || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={student?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input value={student?.dateOfBirth || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input value={student?.gender || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Input value={student?.classId || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input value={student?.academicYear || ""} disabled />
            </div>
          </div>
          <div className="mt-6">
            <Button asChild>
              <a href="/student/change-password">Change Password</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

