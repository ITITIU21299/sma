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
    const semester = searchParams.get("semester") || null;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")) : null;
    const classId = searchParams.get("id"); // For getting single class details

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const adminService = new AdminService(supabase);

    if (classId) {
      // Get single class details
      const classDetails = await adminService.getClassDetails(classId);
      return NextResponse.json({
        success: true,
        data: classDetails,
      });
    } else {
      // Get all classes
      const classes = await adminService.getAllClasses(searchQuery, semester, year);
      return NextResponse.json({
        success: true,
        data: classes,
      });
    }
  } catch (error) {
    console.error("Error fetching classes:", error);
    return handleApiError(error, "fetch classes");
  }
}

