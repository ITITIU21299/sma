"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Exam } from "@/models/Exam";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function StudentExamSchedulePage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch("/api/student/exam-schedule");
        // const data = await response.json();
        
        // Placeholder data
        const mockExams = [
          new Exam("Mathematics", "2024-08-20", "Week 1", "08:00", "10:00", "Room 101", "1", "2024"),
          new Exam("Physics", "2024-08-22", "Week 1", "08:00", "10:00", "Room 102", "1", "2024"),
        ];
        setExams(mockExams);
      } catch (error) {
        console.error("Error fetching exam schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Exam Schedule</h1>

      <div className="grid grid-cols-1 gap-4">
        {exams.map((exam, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{exam.getSubject()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{exam.getDate()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-semibold">
                      {exam.getStartTime()} - {exam.getEndTime()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Room</p>
                    <p className="font-semibold">{exam.getRoomNumber()}</p>
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

