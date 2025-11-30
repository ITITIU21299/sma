import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { AttendanceService } from "@/services/AttendanceService";
import { StaffService } from "@/services/StaffService";

export async function GET(request) {
  try {
    // Get session from cookie
    const userCookie = request.cookies.get("user");
    if (!userCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    if (user.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const attendanceService = new AttendanceService(supabase);

    if (classId && date) {
      // Get attendance for a specific class and date
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
    // Get session from cookie
    const userCookie = request.cookies.get("user");
    if (!userCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    if (user.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { classId, studentId, date, status, bulkAttendance } = body;

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
        staffId
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

