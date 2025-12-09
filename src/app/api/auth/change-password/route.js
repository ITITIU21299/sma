import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { UserService } from "@/services/UserService";
import { getUserFromRequest } from "@/lib/auth-guard";

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const userService = new UserService(supabase);

    // Change password
    const success = await userService.changePassword(
      user.username,
      currentPassword,
      newPassword
    );

    if (!success) {
      return NextResponse.json(
        { error: "Invalid current password or failed to update password" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

