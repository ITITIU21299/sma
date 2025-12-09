import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { AdminService } from "@/services/AdminService";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(request) {
  try {
    // Get session from cookie
    const userCookie = request.cookies.get("user");
    if (!userCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search") || null;
    const classLevel = searchParams.get("classLevel") || null;
    const studentId = searchParams.get("id"); // For getting single student details

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const adminService = new AdminService(supabase);

    if (studentId) {
      // Get single student details
      const studentDetails = await adminService.getStudentDetails(studentId);
      return NextResponse.json({
        success: true,
        data: studentDetails,
      });
    } else {
      // Get all students
      const students = await adminService.getAllStudents(searchQuery, classLevel);
      return NextResponse.json({
        success: true,
        data: students,
      });
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    return handleApiError(error, "fetch students");
  }
}

