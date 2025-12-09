import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { AttendanceService } from "@/services/AttendanceService";
import { StaffService } from "@/services/StaffService";
import { requireRole } from "@/lib/auth-guard";

export async function GET(request) {
  try {
    const { ok, user } = requireRole(request, "staff");
    if (!ok) {
      return NextResponse.json(
        { error: user ? "Forbidden" : "Unauthorized" },
        { status: user ? 403 : 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const section = searchParams.get("section");
    const semesterStartDate = searchParams.get("semesterStartDate") || "2025-09-01";
    const date = searchParams.get("date"); // Keep for backward compatibility

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const attendanceService = new AttendanceService(supabase);

    if (classId && section) {
      // Get students and attendance for a specific class and section
      const students = await attendanceService.getClassStudents(classId);
      const attendance = await attendanceService.getClassAttendanceBySection(
        classId,
        parseInt(section),
        semesterStartDate
      );
      return NextResponse.json({
        success: true,
        students,
        attendance,
      });
    } else if (classId && date) {
      // Get attendance for a specific class and date (backward compatibility)
      const attendance = await attendanceService.getClassAttendance(
        classId,
        date
      );
      return NextResponse.json({
        success: true,
        attendance,
      });
    } else if (classId) {
      // Get students for a class
      const students = await attendanceService.getClassStudents(classId);
      return NextResponse.json({
        success: true,
        students,
      });
    } else {
      return NextResponse.json(
        { error: "classId parameter is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { ok, user } = requireRole(request, "staff");
    if (!ok) {
      return NextResponse.json(
        { error: user ? "Forbidden" : "Unauthorized" },
        { status: user ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { classId, studentId, date, status, bulkAttendance, section, semesterStartDate } = body;

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const staffService = new StaffService(supabase);
    const attendanceService = new AttendanceService(supabase);

    // Get staff_id from username
    const staffId = await staffService.getStaffIdByUsername(user.username);
    if (!staffId) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    if (bulkAttendance && Array.isArray(bulkAttendance)) {
      // Mark attendance for multiple students
      const result = await attendanceService.markBulkAttendance(
        classId,
        bulkAttendance,
        date,
        staffId,
        section || null,
        semesterStartDate || null
      );
      return NextResponse.json({
        success: true,
        attendance: result,
      });
    } else if (classId && studentId && date && status) {
      // Mark attendance for a single student
      const result = await attendanceService.markAttendance(
        classId,
        studentId,
        date,
        status,
        staffId
      );
      return NextResponse.json({
        success: true,
        attendance: result,
      });
    } else {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

