"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Attendance } from "@/models/Attendance";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch("/api/student/attendance");
        // const data = await response.json();
        
        // Placeholder data
        const mockAttendance = [
          new Attendance("A001", "S001", "Section A", "present"),
          new Attendance("A002", "S001", "Section A", "absent"),
          new Attendance("A003", "S001", "Section A", "late"),
        ];
        setAttendance(mockAttendance);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "absent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "";
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance</h1>

      <div className="grid grid-cols-1 gap-4">
        {attendance.map((record, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(record.getStatus())}
                  <div>
                    <p className="font-semibold">Section: {record.getSectionId()}</p>
                    <p className="text-sm text-muted-foreground">
                      Assignment ID: {record.getAssignmentId()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(
                    record.getStatus()
                  )}`}
                >
                  {record.getStatus()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

