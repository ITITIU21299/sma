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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const semesterStartDate = searchParams.get("semesterStartDate");

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const studentService = new StudentService(supabase);

    // Get student_id from username with error handling
    let studentId;
    try {
      studentId = await studentService.getStudentIdByUsername(user.username);
    } catch (networkError) {
      console.error("Network error fetching student ID:", networkError);
      return NextResponse.json(
        { 
          error: networkError.message || "Database connection error. Please try again." 
        },
        { status: 503 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // If classId is provided, get attendance by class and section
    if (classId) {
      try {
        // Default semester start date if not provided
        const defaultStartDate = semesterStartDate || "2025-09-01";
        const attendanceBySection = await studentService.getStudentAttendanceByClass(
          studentId,
          classId,
          defaultStartDate
        );
        return NextResponse.json({
          success: true,
          data: attendanceBySection,
        });
      } catch (error) {
        console.error("Error fetching attendance by class:", error);
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes("Network error") || errorMessage.includes("fetch failed")) {
          return NextResponse.json(
            { error: "Database connection error. Please try again." },
            { status: 503 }
          );
        }
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
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
      console.error("Error fetching student classes:", error);
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("Network error") || errorMessage.includes("fetch failed")) {
        return NextResponse.json(
          { error: "Database connection error. Please try again." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    const errorMessage = error?.message || String(error);
    if (errorMessage.includes("Network error") || errorMessage.includes("fetch failed")) {
      return NextResponse.json(
        { error: "Database connection error. Please try again." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

