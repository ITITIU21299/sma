import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { AdminService } from "@/services/AdminService";
import { handleApiError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth-guard";

export async function GET(request) {
  try {
    const { ok, user } = requireRole(request, "admin");
    if (!ok) {
      return NextResponse.json(
        { error: user ? "Forbidden" : "Unauthorized" },
        { status: user ? 403 : 401 }
      );
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

