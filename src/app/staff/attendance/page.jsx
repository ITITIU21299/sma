"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Attendance } from "@/models/Attendance";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function StaffAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch("/api/staff/attendance");
        // const data = await response.json();
        
        // Placeholder data
        const mockAttendance = [
          new Attendance("A001", "S001", "Section A", "present"),
          new Attendance("A002", "S002", "Section A", "absent"),
          new Attendance("A003", "S003", "Section A", "late"),
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

  const handleUpdateAttendance = async (assignmentId, newStatus) => {
    try {
      // TODO: Replace with actual API call
      // await fetch("/api/staff/attendance", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ assignmentId, status: newStatus }),
      // });
      
      // Update local state
      setAttendance((prev) =>
        prev.map((record) =>
          record.getAssignmentId() === assignmentId
            ? new Attendance(assignmentId, record.getStudentId(), record.getSectionId(), newStatus)
            : record
        )
      );
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Attendance</h1>

      <div className="grid grid-cols-1 gap-4">
        {attendance.map((record, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(record.getStatus())}
                  <div>
                    <p className="font-semibold">Student ID: {record.getStudentId()}</p>
                    <p className="text-sm text-muted-foreground">
                      Section: {record.getSectionId()} | Assignment: {record.getAssignmentId()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold capitalize bg-gray-100 dark:bg-gray-800">
                    {record.getStatus()}
                  </span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateAttendance(record.getAssignmentId(), "present")}
                    >
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateAttendance(record.getAssignmentId(), "absent")}
                    >
                      Absent
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateAttendance(record.getAssignmentId(), "late")}
                    >
                      Late
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

