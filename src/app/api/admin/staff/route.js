import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { AdminService } from "@/services/AdminService";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(request) {
  try {
    // Get session from cookie
    const userCookie = request.cookies.get("user");
    if (!userCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

