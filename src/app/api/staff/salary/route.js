import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
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

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const staffService = new StaffService(supabase);

    // Get staff_id from username
    const staffId = await staffService.getStaffIdByUsername(user.username);
    if (!staffId) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Get staff salaries
    const salaries = await staffService.getStaffSalaries(staffId);

    return NextResponse.json({
      success: true,
      salaries,
    });
  } catch (error) {
    console.error("Error fetching staff salaries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

