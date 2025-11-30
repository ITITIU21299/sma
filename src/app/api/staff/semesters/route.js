import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { TimetableService } from "@/services/TimetableService";

export async function GET(request) {
  try {
    // Get session from cookie
    const userCookie = request.cookies.get("user");
    if (!userCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = JSON.parse(userCookie.value);
    if (user.role !== "staff") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
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

