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

