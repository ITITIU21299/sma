/**
 * Attendance Service - OOP approach for data access using Supabase
 */
export class AttendanceService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Get students enrolled in a class
   * @param {string} classId - Class UUID
   * @returns {Promise<Array>} Array of enrolled students
   */
  async getClassStudents(classId) {
    const { data, error } = await this.supabase
      .from("enrollments")
      .select(`
        student_id,
        students:student_id (
          id,
          full_name
        )
      `)
      .eq("class_id", classId);

    if (error) {
      console.error("Error fetching class students:", error);
      throw error;
    }

    return (data || []).map((enrollment) => ({
      student_id: enrollment.student_id,
      full_name: enrollment.students?.full_name || "Unknown Student",
    }));
  }

  /**
   * Get attendance records for a class on a specific date
   * @param {string} classId - Class UUID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of attendance records
   */
  async getClassAttendance(classId, date) {
    const { data, error } = await this.supabase
      .from("attendance")
      .select(`
        id,
        student_id,
        date,
        status,
        marked_by,
        students:student_id (
          id,
          full_name
        )
      `)
      .eq("class_id", classId)
      .eq("date", date);

    if (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }

    return (data || []).map((record) => ({
      id: record.id,
      student_id: record.student_id,
      student_name: record.students?.full_name || "Unknown Student",
      date: record.date,
      status: record.status,
      marked_by: record.marked_by,
    }));
  }

  /**
   * Mark or update attendance
   * @param {string} classId - Class UUID
   * @param {string} studentId - Student UUID
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} status - Status: 'present', 'absent', or 'late'
   * @param {string} staffId - Staff UUID who is marking attendance
   * @returns {Promise<Object>} Created or updated attendance record
   */
  async markAttendance(classId, studentId, date, status, staffId) {
    // Check if attendance already exists
    const { data: existing, error: checkError } = await this.supabase
      .from("attendance")
      .select("id")
      .eq("class_id", classId)
      .eq("student_id", studentId)
      .eq("date", date)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected for new records
      console.error("Error checking existing attendance:", checkError);
      throw checkError;
    }

    if (existing) {
      // Update existing record
      const { data, error } = await this.supabase
        .from("attendance")
        .update({
          status,
          marked_by: staffId,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating attendance:", error);
        throw error;
      }

      return data;
    } else {
      // Create new record
      const { data, error } = await this.supabase
        .from("attendance")
        .insert({
          class_id: classId,
          student_id: studentId,
          date,
          status,
          marked_by: staffId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating attendance:", error);
        throw error;
      }

      return data;
    }
  }

  /**
   * Mark attendance for multiple students at once
   * @param {string} classId - Class UUID
   * @param {Array} attendanceData - Array of {student_id, status}
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} staffId - Staff UUID who is marking attendance
   * @returns {Promise<Array>} Array of created/updated attendance records
   */
  async markBulkAttendance(classId, attendanceData, date, staffId) {
    const records = attendanceData.map((item) => ({
      class_id: classId,
      student_id: item.student_id,
      date,
      status: item.status,
      marked_by: staffId,
    }));

    // First, delete existing records for this class and date
    await this.supabase
      .from("attendance")
      .delete()
      .eq("class_id", classId)
      .eq("date", date);

    // Then insert new records
    const { data, error } = await this.supabase
      .from("attendance")
      .insert(records)
      .select();

    if (error) {
      console.error("Error creating bulk attendance:", error);
      throw error;
    }

    return data || [];
  }
}

