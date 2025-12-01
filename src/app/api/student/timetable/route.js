import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { StudentService } from "@/services/StudentService";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(request) {
  try {
    // Get session from cookie
    const userCookie = request.cookies.get("user");
    if (!userCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = JSON.parse(userCookie.value);
    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester") || "1";
    const year = searchParams.get("year") || new Date().getFullYear();
    const week = searchParams.get("week") || "1";

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
      const timetableData = await studentService.getStudentTimetable(
        studentId,
        semester,
        parseInt(year)
      );

      return NextResponse.json({
        success: true,
        data: timetableData,
        semester,
        year: parseInt(year),
        week: parseInt(week),
      });
    } catch (error) {
      return handleApiError(error, "student timetable");
    }
  } catch (error) {
    return handleApiError(error, "student timetable");
  }
}

