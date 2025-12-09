import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { StudentService } from "@/services/StudentService";
import { handleApiError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth-guard";

function getSemesterStartDate(semester, year) {
  const sem = semester?.toString().trim().toLowerCase();
  const y = parseInt(year, 10) || new Date().getFullYear();
  if (sem === "fall" || sem === "1") return new Date(y, 8, 1); // Sep 1
  if (sem === "spring" || sem === "2") return new Date(y, 0, 1); // Jan 1
  if (sem === "summer" || sem === "3") return new Date(y, 5, 1); // Jun 1
  return new Date(y, 0, 1);
}

export async function GET(request) {
  try {
    const { ok, user } = requireRole(request, "student");
    if (!ok) {
      return NextResponse.json(
        { error: user ? "Forbidden" : "Unauthorized" },
        { status: user ? 403 : 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester") || "1";
    const year = searchParams.get("year") || new Date().getFullYear();
    const week = parseInt(searchParams.get("week") || "1", 10);

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const studentService = new StudentService(supabase);

    // Get student_id from username with error handling
    let studentId;
    try {
      studentId = await studentService.getStudentIdByUsername(user.username);
    } catch (networkError) {
      console.error("Network error fetching student ID:", networkError);
      return handleApiError(networkError, "student timetable");
    }

    if (!studentId) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Get timetable data
    try {
      const startDate = getSemesterStartDate(semester, year);
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (week - 1) * 7);
      // Align to Monday of that week (day 1 = Monday)
      const offsetToMonday = ((weekStart.getDay() + 6) % 7);
      weekStart.setDate(weekStart.getDate() - offsetToMonday);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const timetableData = await studentService.getStudentTimetable(
        studentId,
        semester,
        parseInt(year, 10),
        weekStart,
        weekEnd
      );

      return NextResponse.json({
        success: true,
        data: timetableData,
        semester,
        year: parseInt(year),
        week,
      });
    } catch (error) {
      return handleApiError(error, "student timetable");
    }
  } catch (error) {
    return handleApiError(error, "student timetable");
  }
}

