"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardList } from "lucide-react";

export default function StaffAssignRoomPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch classes and rooms on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, roomsRes] = await Promise.all([
          fetch("/api/staff/classes"),
          fetch("/api/staff/assign-room"),
        ]);

        const classesData = await classesRes.json();
        const roomsData = await roomsRes.json();

        if (classesData.success && classesData.classes) {
          setClasses(classesData.classes);
        }

        if (roomsData.success && roomsData.rooms) {
          setRooms(roomsData.rooms);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch timetable entries when class is selected
  useEffect(() => {
    if (!selectedClass) {
      setTimetableEntries([]);
      return;
    }

    const fetchTimetable = async () => {
      setLoadingTimetable(true);
      try {
        const response = await fetch(
          `/api/staff/timetable?semester=${selectedClass.semester}&year=${selectedClass.year}`
        );
        const data = await response.json();

        if (data.success && data.data) {
          // Filter timetable entries for selected class
          const classTimetable = data.data.filter(
            (entry) => entry.class_id === selectedClass.id
          );
          setTimetableEntries(classTimetable);
        }
      } catch (error) {
        console.error("Error fetching timetable:", error);
      } finally {
        setLoadingTimetable(false);
      }
    };

    fetchTimetable();
  }, [selectedClass]);

  const handleRoomChange = (timetableId, roomId) => {
    setTimetableEntries((prev) =>
      prev.map((entry) =>
        entry.id === timetableId ? { ...entry, room_id: roomId } : entry
      )
    );
  };

  const handleSubmit = async (timetableId, roomId) => {
    if (!timetableId || !roomId) {
      alert("Please select a room");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/staff/assign-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass.id,
          roomId,
          timetableId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        // Refresh timetable entries
        const timetableRes = await fetch(
          `/api/staff/timetable?semester=${selectedClass.semester}&year=${selectedClass.year}`
        );
        const timetableData = await timetableRes.json();
        if (timetableData.success && timetableData.data) {
          const classTimetable = timetableData.data.filter(
            (entry) => entry.class_id === selectedClass.id
          );
          setTimetableEntries(classTimetable);
        }
      } else {
        alert(data.error || "Failed to assign room");
      }
    } catch (error) {
      console.error("Error assigning room:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Assign Room</h1>

      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5" />
            <span>Select Class</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="classSelect">Class</Label>
            <select
              id="classSelect"
              value={selectedClass?.id || ""}
              onChange={(e) => {
                const classId = e.target.value;
                const cls = classes.find((c) => c.id === classId);
                setSelectedClass(cls || null);
              }}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">-- Select a class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} - {cls.subject_name} ({cls.semester}/{cls.year})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Entries */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Class Schedule - Assign Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md">
                Room assigned successfully!
              </div>
            )}
            {loadingTimetable ? (
              <div className="text-center py-8">Loading schedule...</div>
            ) : timetableEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No timetable entries found for this class
              </div>
            ) : (
              <div className="space-y-4">
                {timetableEntries.map((entry) => {
                  const dayNames = [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ];
                  const dayName = dayNames[entry.day_of_week - 1];

                  return (
                    <Card key={entry.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          <div>
                            <Label>Day</Label>
                            <Input value={dayName} disabled />
                          </div>
                          <div>
                            <Label>Time</Label>
                            <Input
                              value={`${entry.start_time} - ${entry.end_time}`}
                              disabled
                            />
                          </div>
                          <div>
                            <Label htmlFor={`room-${entry.id}`}>Room</Label>
                            <select
                              id={`room-${entry.id}`}
                              value={entry.room_id || ""}
                              onChange={(e) =>
                                handleRoomChange(entry.id, e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-md bg-background"
                            >
                              <option value="">-- Select room --</option>
                              {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                  {room.room_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Button
                              onClick={() =>
                                handleSubmit(entry.id, entry.room_id)
                              }
                              disabled={submitting || !entry.room_id}
                              className="w-full"
                            >
                              {submitting ? "Assigning..." : "Assign Room"}
                            </Button>
                          </div>
                        </div>
                        {entry.room_name && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Current room: {entry.room_name}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Please select a class to assign rooms
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
