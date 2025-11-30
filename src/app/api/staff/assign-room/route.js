import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { StaffService } from "@/services/StaffService";

export async function POST(request) {
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

    const body = await request.json();
    const { classId, roomId, timetableId } = body;

    if (!classId || !roomId) {
      return NextResponse.json(
        { error: "classId and roomId are required" },
        { status: 400 }
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

    if (timetableId) {
      // Update existing timetable entry
      const { data, error } = await supabase
        .from("timetable")
        .update({ room_id: roomId })
        .eq("id", timetableId)
        .select()
        .single();

      if (error) {
        console.error("Error updating room assignment:", error);
        return NextResponse.json(
          { error: "Failed to update room assignment" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        timetable: data,
      });
    } else {
      // Create new timetable entry (this would require more info like day, time)
      return NextResponse.json(
        { error: "timetableId is required for updating room assignment" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error assigning room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get available rooms
export async function GET(request) {
  try {
    const supabase = await createSupabaseScriptClient();

    const { data, error } = await supabase
      .from("rooms")
      .select("id, room_name")
      .order("room_name");

    if (error) {
      console.error("Error fetching rooms:", error);
      return NextResponse.json(
        { error: "Failed to fetch rooms" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rooms: data || [],
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

