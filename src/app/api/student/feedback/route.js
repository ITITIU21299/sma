import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { StudentService } from "@/services/StudentService";
import { handleApiError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth-guard";

export async function POST(request) {
  try {
    const { ok, user } = requireRole(request, "student");
    if (!ok) {
      return NextResponse.json(
        { error: user ? "Forbidden" : "Unauthorized" },
        { status: user ? 403 : 401 }
      );
    }

    const { category, title, message, isAnonymous } = await request.json();

    // Validate required fields
    if (!category || !message) {
      return NextResponse.json(
        { error: "Category and message are required" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['teacher', 'class', 'facility', 'suggestion', 'complaint', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const studentService = new StudentService(supabase);

    // Get student_id from username
    const studentId = await studentService.getStudentIdByUsername(user.username);
    if (!studentId) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Submit feedback
    const feedback = await studentService.submitFeedback(
      studentId,
      category,
      title || null,
      message,
      isAnonymous || false
    );

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return handleApiError(error, "submit feedback");
  }
}

