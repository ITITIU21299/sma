import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { StudentService } from "@/services/StudentService";
import { handleApiError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth-guard";

export async function GET(request) {
  try {
    const { ok, user } = requireRole(request, "student");
    if (!ok) {
      return NextResponse.json(
        { error: user ? "Forbidden" : "Unauthorized" },
        { status: user ? 403 : 401 }
      );
    }

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const studentService = new StudentService(supabase);

    // Get student_id from username with error handling
    let studentId;
    try {
      studentId = await studentService.getStudentIdByUsername(user.username);
    } catch (networkError) {
      console.error("Network error fetching student ID:", networkError);
      return handleApiError(networkError, "student dashboard");
    }

    if (!studentId) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Get dashboard stats
    try {
      const stats = await studentService.getDashboardStats(studentId);
      const profile = await studentService.getStudentProfile(studentId);

      // Get unpaid fees count
      const { data: feesData } = await supabase
        .from("student_fees")
        .select("id", { count: "exact", head: true })
        .eq("student_id", studentId)
        .eq("paid", false);

      const unpaidFeesCount = feesData?.length || 0;

      // Get upcoming exams
      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select("class_id")
        .eq("student_id", studentId);

      let upcomingExams = [];
      if (enrollmentsData && enrollmentsData.length > 0) {
        const classIds = enrollmentsData.map((e) => e.class_id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: examsData } = await supabase
          .from("exams")
          .select(`
            id,
            exam_type,
            exam_date,
            classes:class_id (
              id,
              class_name
            )
          `)
          .in("class_id", classIds)
          .gte("exam_date", today.toISOString().split("T")[0])
          .order("exam_date", { ascending: true })
          .limit(5);

        if (examsData) {
          upcomingExams = examsData.map((exam) => ({
            id: exam.id,
            examType: exam.exam_type,
            examDate: exam.exam_date,
            className: exam.classes?.class_name || "Unknown",
          }));
        }
      }

      // Get recent exam scores
      const { data: scoresData } = await supabase
        .from("student_scores")
        .select(`
          id,
          score,
          exams:exam_id (
            id,
            exam_type,
            exam_date,
            classes:class_id (
              id,
              class_name
            )
          )
        `)
        .eq("student_id", studentId)
        .order("exams.exam_date", { ascending: false })
        .limit(5);

      const recentScores = scoresData ? scoresData.map((score) => ({
        id: score.id,
        score: score.score,
        examType: score.exams?.exam_type || "Unknown",
        examDate: score.exams?.exam_date || null,
        className: score.exams?.classes?.class_name || "Unknown",
      })) : [];

      return NextResponse.json({
        success: true,
        name: profile?.full_name || "Student",
        gpa: parseFloat(stats.gpa) || 0,
        attendanceRate: parseFloat(stats.attendanceRate) || 0,
        totalClasses: stats.totalClasses || 0,
        unpaidFeesCount,
        upcomingExams,
        recentScores,
      });
    } catch (error) {
      return handleApiError(error, "student dashboard stats");
    }
  } catch (error) {
    return handleApiError(error, "student dashboard");
  }
}

