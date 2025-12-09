/**
 * Timetable Service - OOP approach for data access using Supabase
 */
import { retrySupabaseQuery } from "@/lib/retry";

export class TimetableService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Get timetable for a staff member
   * @param {string} staffId - Staff UUID
   * @param {string} semester - Semester (e.g., "1", "2")
   * @param {number} year - Academic year (e.g., 2025)
   * @returns {Promise<Array>} Array of timetable entries
   */
  async getStaffTimetable(staffId, semester, year, weekStart = null, weekEnd = null) {
    const semesterAliases = this.getSemesterAliases(semester);
    // First get classes for this staff, semester, and year
    const { data: classesData, error: classesError } = await this.supabase
      .from("classes")
      .select("id")
      .eq("staff_id", staffId)
      .in("semester", semesterAliases)
      .eq("year", year);

    if (classesError) {
      console.error("Error fetching classes:", classesError);
      throw classesError;
    }

    if (!classesData || classesData.length === 0) {
      return [];
    }

    const classIds = classesData.map((c) => c.id);

    // Then get timetable entries for these classes
    const { data, error } = await this.supabase
      .from("timetable")
      .select(
        `
        id,
        day_of_week,
        start_time,
        end_time,
        class_id,
        room_id,
        staff_id,
        classes:class_id (
          id,
          class_name,
          semester,
          year,
          subject_id,
          subjects:subject_id (
            id,
            name,
            code
          )
        ),
        rooms:room_id (
          id,
          room_name
        )
      `
      )
      .in("class_id", classIds)
      .eq("staff_id", staffId);

    if (error) {
      console.error("Error fetching staff timetable:", error);
      throw error;
    }

    // If no week range provided, return base timetable
    if (!weekStart || !weekEnd) {
      return (data || []).map((entry) => ({
        id: entry.id,
        class_id: entry.class_id,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
        subject_name: entry.classes?.subjects?.name || "Unknown Subject",
        subject_code: entry.classes?.subjects?.code || "",
        class_name: entry.classes?.class_name || "",
        room_id: entry.room_id,
        room_name: entry.rooms?.room_name || "TBA",
        semester: entry.classes?.semester || semester,
        year: entry.classes?.year || year,
      }));
    }

    // Week-specific: apply overrides and exam skips
    const startStr = weekStart.toISOString().split("T")[0];
    const endStr = weekEnd.toISOString().split("T")[0];

    // Overrides
    const { data: overrides } = await this.supabase
      .from("backup_room_assignment")
      .select(
        `
        class_id,
        room_id,
        override_date,
        start_time,
        end_time,
        action,
        rooms:room_id (room_name)
      `
      )
      .in("class_id", classIds)
      .gte("override_date", startStr)
      .lte("override_date", endStr);

    const overridesMap =
      overrides?.reduce((acc, o) => {
        const key = `${o.class_id}-${o.override_date}`;
        acc[key] = o;
        return acc;
      }, {}) || {};

    // Exams (skip class on exam date)
    const { data: exams } = await this.supabase
      .from("exams")
      .select("class_id, exam_date")
      .in("class_id", classIds)
      .gte("exam_date", startStr)
      .lte("exam_date", endStr);

    const examSet = new Set((exams || []).map((e) => `${e.class_id}-${e.exam_date}`));

    const results = [];
    for (const entry of data || []) {
      const dateForEntry = new Date(weekStart);
      dateForEntry.setDate(weekStart.getDate() + (entry.day_of_week - 1));
      const dateStr = dateForEntry.toISOString().split("T")[0];

      // Skip if exam on that date
      if (examSet.has(`${entry.class_id}-${dateStr}`)) {
        continue;
      }

      const ov = overridesMap[`${entry.class_id}-${dateStr}`];
      if (ov) {
        if (ov.action === "cancel") {
          continue;
        }
        results.push({
          id: entry.id,
          class_id: entry.class_id,
          day_of_week: entry.day_of_week,
          start_time: ov.start_time || entry.start_time,
          end_time: ov.end_time || entry.end_time,
          subject_name: entry.classes?.subjects?.name || "Unknown Subject",
          subject_code: entry.classes?.subjects?.code || "",
          class_name: entry.classes?.class_name || "",
          room_id: ov.room_id || entry.room_id,
          room_name: ov.rooms?.room_name || entry.rooms?.room_name || "TBA",
          semester: entry.classes?.semester || semester,
          year: entry.classes?.year || year,
          override_date: dateStr,
          override_action: ov.action,
        });
      } else {
        results.push({
          id: entry.id,
          class_id: entry.class_id,
          day_of_week: entry.day_of_week,
          start_time: entry.start_time,
          end_time: entry.end_time,
          subject_name: entry.classes?.subjects?.name || "Unknown Subject",
          subject_code: entry.classes?.subjects?.code || "",
          class_name: entry.classes?.class_name || "",
          room_id: entry.room_id,
          room_name: entry.rooms?.room_name || "TBA",
          semester: entry.classes?.semester || semester,
          year: entry.classes?.year || year,
          override_date: dateStr,
        });
      }
    }

    return results;
  }

  /**
   * Get staff ID from username
   * @param {string} username - Username (could be email or username field)
   * @returns {Promise<string|null>} Staff UUID or null
   */
  async getStaffIdByUsername(username) {
    try {
      if (!username || username.trim() === "") {
        console.error("getStaffIdByUsername: Empty username provided");
        return null;
      }

      const trimmedUsername = username.trim();
      let userData = null;
      let userError = null;

      // Try email field first with retry
      try {
        const { data: emailData, error: emailError } = await retrySupabaseQuery(() =>
          this.supabase
            .from("users")
            .select("id")
            .eq("email", trimmedUsername)
            .maybeSingle()
        );

        if (!emailError && emailData) {
          userData = emailData;
        } else {
          userError = emailError;
        }
      } catch (networkError) {
        console.error("Network error fetching user by email:", networkError);
        userError = networkError;
      }

      // Try user_id field as fallback with retry
      if (!userData) {
        try {
          const { data: userIdData, error: userIdError } = await retrySupabaseQuery(() =>
            this.supabase
              .from("users")
              .select("id")
              .eq("user_id", trimmedUsername)
              .maybeSingle()
          );

          if (!userIdError && userIdData) {
            userData = userIdData;
          } else if (!userError) {
            userError = userIdError;
          }
        } catch (networkError) {
          console.error("Network error fetching user by user_id:", networkError);
          if (!userError) {
            userError = networkError;
          }
        }
      }

      if (userError || !userData) {
        // Check if it's a network error
        const errorMessage = userError?.message || String(userError || "");
        if (errorMessage.includes("fetch failed") || errorMessage.includes("Network error")) {
          throw new Error("Network error: Unable to connect to database. Please try again.");
        }
        console.error("Error fetching user:", userError);
        return null;
      }

      // Then get staff_id from staff table with retry
      try {
        const { data: staffData, error: staffError } = await retrySupabaseQuery(() =>
          this.supabase
            .from("staff")
            .select("id")
            .eq("user_id", userData.id)
            .maybeSingle()
        );

        if (staffError) {
          const errorMessage = staffError.message || String(staffError);
          if (errorMessage.includes("fetch failed") || errorMessage.includes("Network error")) {
            throw new Error("Network error: Unable to connect to database. Please try again.");
          }
          console.error("Error fetching staff:", staffError);
          return null;
        }

        if (!staffData) {
          console.error("Staff record not found for user:", userData.id);
          return null;
        }

        return staffData.id;
      } catch (networkError) {
        console.error("Network error fetching staff:", networkError);
        throw networkError;
      }
    } catch (exception) {
      console.error("Exception in getStaffIdByUsername:", exception);
      // Re-throw network errors so API routes can handle them
      if (exception.message && exception.message.includes("Network error")) {
        throw exception;
      }
      return null;
    }
  }

  /**
   * Get available semesters and years for a staff member
   * @param {string} staffId - Staff UUID
   * @returns {Promise<Array>} Array of {semester, year} objects
   */
  async getAvailableSemesters(staffId) {
    const { data, error } = await this.supabase
      .from("classes")
      .select("semester, year")
      .eq("staff_id", staffId);

    if (error) {
      console.error("Error fetching available semesters:", error);
      throw error;
    }

    // Extract unique semester/year combinations
    const semesters = new Set();
    (data || []).forEach((entry) => {
      if (entry.semester && entry.year) {
        semesters.add(`${entry.semester}-${entry.year}`);
      }
    });

    return Array.from(semesters).map((combo) => {
      const [semester, year] = combo.split("-");
      return { semester, year: parseInt(year) };
    });
  }

  getSemesterAliases(semester) {
    if (!semester) return [];
    const s = semester.toString().trim().toLowerCase();
    if (s === "fall" || s === "1") return ["Fall", "fall", "1"];
    if (s === "spring" || s === "2") return ["Spring", "spring", "2"];
    if (s === "summer" || s === "3") return ["Summer", "summer", "3"];
    return [semester];
  }
}
