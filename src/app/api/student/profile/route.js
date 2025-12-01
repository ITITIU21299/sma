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

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const studentService = new StudentService(supabase);

    // Get student_id from username with error handling
    let studentId;
    try {
      studentId = await studentService.getStudentIdByUsername(user.username);
    } catch (networkError) {
      console.error("Network error fetching student ID:", networkError);
      return handleApiError(networkError, "student profile");
    }

    if (!studentId) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Get student profile
    try {
      const student = await studentService.getStudentProfile(studentId);

      if (!student) {
        return NextResponse.json(
          { error: "Student profile not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        student,
      });
    } catch (error) {
      return handleApiError(error, "student profile");
    }
  } catch (error) {
    return handleApiError(error, "student profile");
  }
}

