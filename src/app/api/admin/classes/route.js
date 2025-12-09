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

