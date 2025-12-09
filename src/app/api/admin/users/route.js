import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { AdminService } from "@/services/AdminService";
import { handleApiError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth-guard";

/**
 * PATCH /api/admin/users
 * Body:
 * {
 *   userId: string (users.id),
 *   role: "student" | "staff",
 *   updates?: {
 *     fullName?, phone?, department?, classLevel?, dateOfBirth?, studentCode?, staffCode?
 *   },
 *   newPassword?: string
 * }
 */
export async function PATCH(request) {
  try {
    const { ok, user } = requireRole(request, "admin");
    if (!ok) {
      return NextResponse.json(
        { error: user ? "Forbidden" : "Unauthorized" },
        { status: user ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { userId, role, updates = {}, newPassword } = body || {};

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    if (!updates && !newPassword) {
      return NextResponse.json(
        { error: "Provide updates and/or newPassword" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseScriptClient();
    const adminService = new AdminService(supabase);

    let updatedProfile = null;
    let passwordReset = false;

    if (updates && Object.keys(updates).length > 0) {
      updatedProfile = await adminService.updateUserProfile(userId, role, updates);
    }

    if (newPassword) {
      await adminService.resetUserPassword(userId, newPassword);
      passwordReset = true;
    }

    return NextResponse.json({
      success: true,
      updatedProfile,
      passwordReset,
    });
  } catch (error) {
    console.error("Error updating user (admin):", error);
    return handleApiError(error, "update user");
  }
}

