import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { StaffService } from "@/services/StaffService";
import { handleApiError } from "@/lib/api-helpers";

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

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const staffService = new StaffService(supabase);

    // Get staff_id from username with error handling
    let staffId;
    try {
      staffId = await staffService.getStaffIdByUsername(user.username);
    } catch (networkError) {
      console.error("Network error fetching staff ID:", networkError);
      return handleApiError(networkError, "staff dashboard");
    }

    if (!staffId) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Get staff profile and dashboard stats
    try {
      const staffProfile = await staffService.getStaffProfile(staffId);
      const stats = await staffService.getDashboardStats(staffId);

      return NextResponse.json({
        success: true,
        staff: staffProfile,
        stats,
      });
    } catch (error) {
      return handleApiError(error, "staff dashboard stats");
    }
  } catch (error) {
    return handleApiError(error, "staff dashboard");
  }
}

