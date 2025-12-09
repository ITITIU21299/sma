import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { StaffService } from "@/services/StaffService";
import { handleApiError } from "@/lib/api-helpers";
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

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const staffService = new StaffService(supabase);

    // Get staff_id from username with error handling
    let staffId;
    try {
      staffId = await staffService.getStaffIdByUsername(user.username);
    } catch (networkError) {
      console.error("Network error fetching staff ID:", networkError);
      return handleApiError(networkError, "staff profile");
    }

    if (!staffId) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Get staff profile
    try {
      const staffProfile = await staffService.getStaffProfile(staffId);
      return NextResponse.json({
        success: true,
        staff: staffProfile,
      });
    } catch (error) {
      return handleApiError(error, "staff profile");
    }
  } catch (error) {
    return handleApiError(error, "staff profile");
  }
}

