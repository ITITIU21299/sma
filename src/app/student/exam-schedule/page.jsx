"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Exam } from "@/models/Exam";
import { Calendar, Clock, MapPin } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";

export default function StudentExamSchedulePage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("midterm");

  const normalizeSemesterLabel = (semester) => {
    if (!semester) return "";
    const s = semester.toString().trim().toLowerCase();
    if (s === "1" || s === "fall") return "Fall";
    if (s === "2" || s === "spring") return "Spring";
    if (s === "3" || s === "summer") return "Summer";
    return semester.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [examsRes, semestersRes] = await Promise.all([
          fetch("/api/student/exam-schedule"),
          fetch("/api/student/semesters"),
        ]);

        const examsJson = await examsRes.json();
        const semestersJson = await semestersRes.json();

        const examRecords =
          examsJson.success && examsJson.data
            ? examsJson.data
                .filter(
                  (exam) =>
                    exam.exam_type === "midterm" || exam.exam_type === "final"
                )
                .map((exam) => {
                  const examDate = new Date(exam.exam_date);
                  const week = Math.ceil(
                    (examDate - new Date(exam.year, 0, 1)) /
                      (7 * 24 * 60 * 60 * 1000)
                  );

                  const startTime = exam.start_time || "08:00";
                  const endTime = exam.end_time || "10:00";
                  const roomName = exam.room_name || "TBA";

                  return new Exam(
                    exam.subject_name,
                    exam.exam_date,
                    `Week ${week}`,
                    startTime,
                    endTime,
                    roomName,
                    exam.semester || "1",
                    exam.year?.toString() ||
                      new Date().getFullYear().toString(),
                    exam.exam_type,
                    exam.class_name || ""
                  );
                })
            : [];

        setExams(examRecords);

        const semesters =
          semestersJson.success && semestersJson.semesters
            ? semestersJson.semesters
            : [];
        setAvailableSemesters(semesters);

        // Determine default semester/year (current)
        const today = new Date();
        const year = today.getFullYear();
        const fallStart = new Date(year, 8, 1);
        const springStart = new Date(year, 0, 1);
        let targetLabel = "Spring";
        let targetYear = year;
        if (today >= fallStart) {
          targetLabel = "Fall";
          targetYear = year;
        } else if (today >= springStart) {
          targetLabel = "Spring";
          targetYear = year;
        }

        const currentSem =
          semesters.find(
            (s) =>
              normalizeSemesterLabel(s.semester) === targetLabel &&
              Number(s.year) === targetYear
          ) || semesters[0];

        if (currentSem) {
          setSelectedSemester(currentSem.semester.toString());
          setSelectedYear(currentSem.year.toString());
        }

        // Default exam type: next upcoming midterm/final in current semester/year
        const upcomingExam = examRecords
          .filter(
            (exam) =>
              (!currentSem ||
                (normalizeSemesterLabel(exam.semester) ===
                  normalizeSemesterLabel(currentSem.semester) &&
                  String(exam.subjectYear) === String(currentSem.year))) &&
              new Date(exam.date) >= new Date()
          )
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        if (upcomingExam?.getExamType()) {
          setSelectedExamType(upcomingExam.getExamType());
        } else {
          const hasMidterm = examRecords.some(
            (e) => e.getExamType() === "midterm"
          );
          setSelectedExamType(hasMidterm ? "midterm" : "final");
        }
      } catch (error) {
        console.error("Error fetching exam schedule:", error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredExams = exams.filter((exam) => {
    const matchesSemester =
      !selectedSemester ||
      normalizeSemesterLabel(exam.getSemester()) ===
        normalizeSemesterLabel(selectedSemester);
    const matchesYear =
      !selectedYear || String(exam.getSubjectYear()) === String(selectedYear);
    const matchesType =
      !selectedExamType || exam.getExamType() === selectedExamType;
    return matchesSemester && matchesYear && matchesType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <ThreeDots
          visible={true}
          height="100"
          width="100"
          color="#4fa94d"
          radius="9"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-roboto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exam Schedule</h1>
          <p className="text-muted-foreground text-sm">
            Filter by semester and exam type to see your upcoming midterm or
            final.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Semester</span>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={
                selectedSemester && selectedYear
                  ? `${selectedSemester}|${selectedYear}`
                  : ""
              }
              onChange={(e) => {
                const [sem, yr] = e.target.value.split("|");
                setSelectedSemester(sem);
                setSelectedYear(yr);
              }}
            >
              {availableSemesters.map((sem) => (
                <option
                  key={`${sem.semester}-${sem.year}`}
                  value={`${sem.semester}|${sem.year}`}
                >
                  {normalizeSemesterLabel(sem.semester)} {sem.year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Exam</span>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
            >
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
            </select>
          </div>
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No exams found for the selected filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredExams.map((exam, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {exam.getSubject()}
                    </CardTitle>
                    {exam.getClassName() && (
                      <p className="text-sm text-muted-foreground">
                        {exam.getClassName()}
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">
                    {exam.getExamType()?.toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">
                        {formatDate(exam.getDate())}
                      </p>
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
      )}
    </div>
  );
}
