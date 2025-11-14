"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardList } from "lucide-react";

export default function StaffAssignRoomPage() {
  const [roomId, setRoomId] = useState("");
  const [sectionGroup, setSectionGroup] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API call
      // await fetch("/api/staff/assign-room", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ roomId, sectionGroup, subjectName }),
      // });
      
      setSubmitted(true);
      setRoomId("");
      setSectionGroup("");
      setSubjectName("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Error assigning room:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Assign Room</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5" />
            <span>Assign Room to Section</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submitted && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md">
              Room assigned successfully!
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomId">Room ID</Label>
              <Input
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                placeholder="Enter room ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sectionGroup">Section Group</Label>
              <Input
                id="sectionGroup"
                value={sectionGroup}
                onChange={(e) => setSectionGroup(e.target.value)}
                required
                placeholder="Enter section group"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjectName">Subject Name</Label>
              <Input
                id="subjectName"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
                placeholder="Enter subject name"
              />
            </div>
            <Button type="submit" className="w-full">
              Assign Room
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

