"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Schedule } from "@/models/Schedule";
import { Calendar, Clock, MapPin, BookOpen } from "lucide-react";

export default function StudentSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch("/api/student/schedule");
        // const data = await response.json();
        
        // Placeholder data
        const mockSchedules = [
          new Schedule("Room 101", "Section A", "Mathematics", "2024-08-15", "Week 1", "08:00", "10:00", "1", "2024"),
          new Schedule("Room 102", "Section A", "Physics", "2024-08-16", "Week 1", "10:00", "12:00", "1", "2024"),
        ];
        setSchedules(mockSchedules);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Room Schedule</h1>

      <div className="grid grid-cols-1 gap-4">
        {schedules.map((schedule, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>{schedule.getSubjectName()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{schedule.getScheduleDate()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-semibold">
                      {schedule.getStartTime()} - {schedule.getEndTime()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Room</p>
                    <p className="font-semibold">{schedule.getRoomId()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-semibold">{schedule.getSectionGroup()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

