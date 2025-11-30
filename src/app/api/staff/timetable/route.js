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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester") || "1";
    const year = searchParams.get("year") || new Date().getFullYear();
    const week = searchParams.get("week") || "1";

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

    // Get timetable data
    const timetableData = await timetableService.getStaffTimetable(
      staffId,
      semester,
      parseInt(year)
    );

    return NextResponse.json({
      success: true,
      data: timetableData,
      semester,
      year: parseInt(year),
      week: parseInt(week),
    });
  } catch (error) {
    console.error("Error fetching staff timetable:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

