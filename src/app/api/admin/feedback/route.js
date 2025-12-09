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

    // Get filters from query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const status = searchParams.get("status") || "all";

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const adminService = new AdminService(supabase);

    // Get all feedback
    const feedback = await adminService.getAllFeedback(category, status);

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return handleApiError(error, "fetch feedback");
  }
}

export async function PATCH(request) {
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

    const { feedbackId, priority, status } = await request.json();

    if (!feedbackId) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const adminService = new AdminService(supabase);

    // Update priority or status
    let updatedFeedback;
    if (priority) {
      updatedFeedback = await adminService.updateFeedbackPriority(
        feedbackId,
        priority
      );
    } else if (status) {
      updatedFeedback = await adminService.updateFeedbackStatus(
        feedbackId,
        status
      );
    } else {
      return NextResponse.json(
        { error: "Either priority or status must be provided" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback priority:", error);
    return handleApiError(error, "update feedback priority");
  }
}

