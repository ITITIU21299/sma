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
        const response = await fetch("/api/student/exam-schedule");
        const data = await response.json();

        if (data.success && data.data) {
          // Transform API data to Exam model format
          const examRecords = data.data.map((exam) => {
            // Calculate week from exam date (rough estimate)
            const examDate = new Date(exam.exam_date);
            const week = Math.ceil((examDate - new Date(exam.year, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
            
            return new Exam(
              exam.subject_name,
              exam.exam_date,
              `Week ${week}`,
              "08:00", // Default start time
              "10:00", // Default end time
              "TBA", // Room not in exam table, would need to join with timetable
              exam.semester || "1",
              exam.year?.toString() || new Date().getFullYear().toString()
            );
          });
          setExams(examRecords);
        } else {
          console.error("Error fetching exam schedule:", data.error);
          setExams([]);
        }
      } catch (error) {
        console.error("Error fetching exam schedule:", error);
        setExams([]);
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

