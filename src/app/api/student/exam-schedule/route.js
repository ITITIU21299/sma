import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { StudentService } from "@/services/StudentService";
import { requireRole } from "@/lib/auth-guard";

export async function GET(request) {
  try {
    const { ok, user } = requireRole(request, "student");
    if (!ok) {
      return NextResponse.json(
        { error: user ? "Forbidden" : "Unauthorized" },
        { status: user ? 403 : 401 }
      );
    }

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const studentService = new StudentService(supabase);

    // Get student_id from username
    const studentId = await studentService.getStudentIdByUsername(user.username);
    if (!studentId) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Parse filters from query params
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester");
    const year = searchParams.get("year");
    const examType = searchParams.get("examType");
    const onlyUpcoming = searchParams.get("onlyUpcoming") === "true";

    // Get exam schedule with filters
    const exams = await studentService.getStudentExamSchedule(studentId, {
      semester,
      year: year || null,
      examType: examType === "midterm" || examType === "final" ? examType : null,
      onlyUpcoming,
    });

    return NextResponse.json({
      success: true,
      data: exams,
    });
  } catch (error) {
    console.error("Error fetching student exam schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

