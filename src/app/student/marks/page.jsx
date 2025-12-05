"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";

export default function StudentMarksPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [marks, setMarks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMarks, setLoadingMarks] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/student/marks");
        const data = await response.json();

        if (data.success && data.classes) {
          setClasses(data.classes);
        } else {
          console.error("Error fetching classes:", data.error);
          setClasses([]);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setMarks(null);
      return;
    }

    const fetchMarks = async () => {
      try {
        setLoadingMarks(true);
        const response = await fetch(
          `/api/student/marks?classId=${selectedClassId}`
        );
        const data = await response.json();

        if (data.success && data.data) {
          setMarks(data.data);
        } else {
          console.error("Error fetching marks:", data.error);
          setMarks(null);
        }
      } catch (error) {
        console.error("Error fetching marks:", error);
        setMarks(null);
      } finally {
        setLoadingMarks(false);
      }
    };

    fetchMarks();
  }, [selectedClassId]);

  const calculateFinalMark = (inclass, midterm, final) => {
    if (inclass === null || midterm === null || final === null) {
      return null;
    }
    return inclass * 0.3 + midterm * 0.3 + final * 0.4;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Marks</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="class-select">Class</Label>
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">-- Select a class --</option>
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name} ({cls.semester}/{cls.year})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {selectedClassId && (
        <div className="space-y-4">
          {loadingMarks ? (
            <div>Loading marks...</div>
          ) : marks ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>
                    {marks.class_name}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      In-class (30%)
                    </Label>
                    <div className="text-2xl font-bold">
                      {marks.inclass !== null ? marks.inclass.toFixed(2) : "N/A"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Midterm (30%)
                    </Label>
                    <div className="text-2xl font-bold">
                      {marks.midterm !== null
                        ? marks.midterm.toFixed(2)
                        : "N/A"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Final (40%)
                    </Label>
                    <div className="text-2xl font-bold">
                      {marks.final !== null ? marks.final.toFixed(2) : "N/A"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Final Mark
                    </Label>
                    <div className="text-2xl font-bold text-primary">
                      {marks.finalMark !== null
                        ? marks.finalMark.toFixed(2)
                        : "N/A"}
                    </div>
                    {marks.finalMark !== null && (
                      <p className="text-xs text-muted-foreground">
                        (30% × {marks.inclass.toFixed(2)}) + (30% ×{" "}
                        {marks.midterm.toFixed(2)}) + (40% ×{" "}
                        {marks.final.toFixed(2)})
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  No marks available for this class.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

