import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { AdminService } from "@/services/AdminService";
import { handleApiError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth-guard";

export async function POST(request) {
  try {
    const { ok, user } = requireRole(request, "admin");
    if (!ok) {
      return NextResponse.json(
        { error: user ? "Forbidden" : "Unauthorized" },
        { status: user ? 403 : 401 }
      );
    }

    const body = await request.json();
    const {
      classId,
      roomId,
      overrideDate,
      startTime,
      endTime,
      action = "room_change",
      staffId = null,
      note = null,
      checkOnly = false,
    } = body || {};

    if (!classId || !roomId || !overrideDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "classId, roomId, overrideDate, startTime, endTime are required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseScriptClient();
    const adminService = new AdminService(supabase);

    // Availability check
    const availability = await adminService.checkRoomAvailability(
      classId,
      roomId,
      overrideDate,
      startTime,
      endTime
    );

    if (checkOnly) {
      return NextResponse.json({
        success: true,
        available: availability.available,
        conflicts: availability.conflicts,
      });
    }

    if (!availability.available) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          conflicts: availability.conflicts,
          error: "Room is not available for the selected time.",
        },
        { status: 409 }
      );
    }

    const override = await adminService.upsertRoomOverride({
      classId,
      roomId,
      overrideDate,
      startTime,
      endTime,
      action,
      staffId,
      note,
      createdBy: user.id || null,
    });

    return NextResponse.json({
      success: true,
      data: override,
    });
  } catch (error) {
    console.error("Error creating room assignment:", error);
    return handleApiError(error, "room assignment");
  }
}

