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

    const supabase = await createSupabaseScriptClient();
    const adminService = new AdminService(supabase);
    const rooms = await adminService.getRooms();

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return handleApiError(error, "fetch rooms");
  }
}

