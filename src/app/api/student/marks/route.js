import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { StudentService } from "@/services/StudentService";
import { handleApiError } from "@/lib/api-helpers";
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const studentService = new StudentService(supabase);

    // Get student_id from username with error handling
    let studentId;
    try {
      studentId = await studentService.getStudentIdByUsername(user.username);
    } catch (networkError) {
      console.error("Network error fetching student ID:", networkError);
      return handleApiError(networkError, "student marks");
    }

    if (!studentId) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // If classId is provided, get marks for that class
    if (classId) {
      try {
        const marks = await studentService.getStudentMarks(studentId, classId);
        return NextResponse.json({
          success: true,
          data: marks,
        });
      } catch (error) {
        return handleApiError(error, "student marks");
      }
    }

    // Otherwise, get all enrolled classes
    try {
      const classes = await studentService.getStudentClasses(studentId);
      return NextResponse.json({
        success: true,
        classes,
      });
    } catch (error) {
      return handleApiError(error, "student classes");
    }
  } catch (error) {
    return handleApiError(error, "student marks");
  }
}

