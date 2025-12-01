import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { StudentService } from "@/services/StudentService";

export async function GET(request) {
  try {
    // Get session from cookie
    const userCookie = request.cookies.get("user");
    if (!userCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    if (user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const studentService = new StudentService(supabase);

    // Get student_id from username
    const studentId = await studentService.getStudentIdByUsername(
      user.username
    );
    if (!studentId) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get available semesters
    const semesters = await studentService.getAvailableSemesters(studentId);

    // If no semesters found, return default
    if (!semesters || semesters.length === 0) {
      const currentYear = new Date().getFullYear();
      return NextResponse.json({
        success: true,
        semesters: [
          { semester: "1", year: currentYear },
          { semester: "2", year: currentYear },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      semesters,
    });
  } catch (error) {
    console.error("Error fetching student semesters:", error);
    // Return default on error
    const currentYear = new Date().getFullYear();
    return NextResponse.json({
      success: true,
      semesters: [
        { semester: "1", year: currentYear },
        { semester: "2", year: currentYear },
      ],
    });
  }
}
