/**
 * Timetable Service - OOP approach for data access using Supabase
 */
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
  async getStaffTimetable(staffId, semester, year) {
    // First get classes for this staff, semester, and year
    const { data: classesData, error: classesError } = await this.supabase
      .from("classes")
      .select("id")
      .eq("staff_id", staffId)
      .eq("semester", semester)
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

    // Transform the data to a simpler format
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

      // Try email field first
      const { data: emailData, error: emailError } = await this.supabase
        .from("users")
        .select("id")
        .eq("email", trimmedUsername)
        .maybeSingle();

      if (!emailError && emailData) {
        userData = emailData;
      } else {
        // Try user_id field as fallback
        const { data: userIdData, error: userIdError } = await this.supabase
          .from("users")
          .select("id")
          .eq("user_id", trimmedUsername)
          .maybeSingle();

        if (!userIdError && userIdData) {
          userData = userIdData;
        } else {
          userError = emailError || userIdError;
        }
      }

      if (userError || !userData) {
        console.error("Error fetching user:", userError);
        return null;
      }

      // Then get staff_id from staff table
      const { data: staffData, error: staffError } = await this.supabase
        .from("staff")
        .select("id")
        .eq("user_id", userData.id)
        .maybeSingle();

      if (staffError) {
        console.error("Error fetching staff:", staffError);
        return null;
      }

      if (!staffData) {
        console.error("Staff record not found for user:", userData.id);
        return null;
      }

      return staffData.id;
    } catch (exception) {
      console.error("Exception in getStaffIdByUsername:", exception);
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
}
