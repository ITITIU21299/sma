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
    const department = searchParams.get("department") || null;
    const staffId = searchParams.get("id"); // For getting single staff details

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const adminService = new AdminService(supabase);

    if (staffId) {
      // Get single staff details
      const staffDetails = await adminService.getStaffDetails(staffId);
      return NextResponse.json({
        success: true,
        data: staffDetails,
      });
    } else {
      // Get all staff
      const staff = await adminService.getAllStaff(searchQuery, department);
      return NextResponse.json({
        success: true,
        data: staff,
      });
    }
  } catch (error) {
    console.error("Error fetching staff:", error);
    return handleApiError(error, "fetch staff");
  }
}

