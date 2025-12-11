import { NextResponse } from "next/server";
import { createSupabaseScriptClient } from "@/lib/supabase/server";
import { StaffService } from "@/services/StaffService";
import { handleApiError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth-guard";

/**
 * Determine current semester based on date.
 * Fall semester starts the first week of September and lasts 15 weeks.
 * Spring semester starts the first week of January.
 * @returns {{semester: string, year: number}}
 */
function getCurrentSemester() {
  const today = new Date();
  const year = today.getFullYear();

  const fallStart = new Date(year, 8, 1); // September 1 (month index 8)
  const springStart = new Date(year, 0, 1); // January 1

  if (today >= fallStart) {
    return { semester: "Fall", year };
  }

  if (today >= springStart) {
    return { semester: "Spring", year };
  }

  // Fallback (should not hit)
  return { semester: "Spring", year };
}

export async function GET(request) {
  try {
    const { ok, user } = requireRole(request, "staff");
    if (!ok) {
      return NextResponse.json(
        { error: user ? "Forbidden" : "Unauthorized" },
        { status: user ? 403 : 401 }
      );
    }

    // Create Supabase client
    const supabase = await createSupabaseScriptClient();
    const staffService = new StaffService(supabase);

    // Get staff_id from username with error handling
    let staffId;
    try {
      staffId = await staffService.getStaffIdByUsername(user.username);
    } catch (networkError) {
      console.error("Network error fetching staff ID:", networkError);
      return handleApiError(networkError, "staff dashboard");
    }

    if (!staffId) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Get current semester
    const currentSemester = getCurrentSemester();

    // Get staff profile and dashboard stats for current semester
    try {
      const staffProfile = await staffService.getStaffProfile(staffId);
      const stats = await staffService.getDashboardStats(
        staffId,
        currentSemester.semester,
        currentSemester.year
      );

      // Get upcoming exams for staff's classes
      const { data: classesData } = await supabase
        .from("classes")
        .select("id")
        .eq("staff_id", staffId)
        .eq("semester", currentSemester.semester)
        .eq("year", currentSemester.year);

      let upcomingExams = [];
      if (classesData && classesData.length > 0) {
        const classIds = classesData.map((c) => c.id);
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

      // Get recent salary status
      const { data: salaryData } = await supabase
        .from("staff_salary")
        .select("id, month_year, status, base_salary, bonus")
        .eq("staff_id", staffId)
        .order("month_year", { ascending: false })
        .limit(1);

      const latestSalary = salaryData && salaryData.length > 0 ? {
        monthYear: salaryData[0].month_year,
        status: salaryData[0].status,
        baseSalary: salaryData[0].base_salary,
        bonus: salaryData[0].bonus || 0,
        totalSalary: parseFloat(salaryData[0].base_salary) + parseFloat(salaryData[0].bonus || 0),
      } : null;

      // Calculate weekly teaching hours from timetable
      let weeklyTeachingHours = 0;
      if (classesData && classesData.length > 0) {
        const classIds = classesData.map((c) => c.id);
        const { data: timetableData } = await supabase
          .from("timetable")
          .select("start_time, end_time")
          .in("class_id", classIds)
          .eq("staff_id", staffId);

        if (timetableData && timetableData.length > 0) {
          // Calculate total hours per week
          timetableData.forEach((entry) => {
            if (entry.start_time && entry.end_time) {
              const start = new Date(`2000-01-01T${entry.start_time}`);
              const end = new Date(`2000-01-01T${entry.end_time}`);
              const diffMs = end - start;
              const diffHours = diffMs / (1000 * 60 * 60); // Convert to hours
              weeklyTeachingHours += diffHours;
            }
          });
          // Round to 1 decimal place
          weeklyTeachingHours = Math.round(weeklyTeachingHours * 10) / 10;
        }
      }

      return NextResponse.json({
        success: true,
        staff: staffProfile,
        stats,
        currentSemester,
        upcomingExams,
        latestSalary,
        weeklyTeachingHours,
      });
    } catch (error) {
      return handleApiError(error, "staff dashboard stats");
    }
  } catch (error) {
    return handleApiError(error, "staff dashboard");
  }
}

