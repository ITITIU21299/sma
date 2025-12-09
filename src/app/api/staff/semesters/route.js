import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { TimetableService } from "@/services/TimetableService";
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
    const timetableService = new TimetableService(supabase);

    // Get staff_id from username
    const staffId = await timetableService.getStaffIdByUsername(user.username);
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      );
    }

    // Get available semesters
    const semesters = await timetableService.getAvailableSemesters(staffId);

    return NextResponse.json({
      success: true,
      semesters: semesters.length > 0 ? semesters : [
        { semester: "1", year: new Date().getFullYear() },
        { semester: "2", year: new Date().getFullYear() }
      ],
    });
  } catch (error) {
    console.error("Error fetching available semesters:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

