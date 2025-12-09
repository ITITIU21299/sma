/**
 * Student Service - OOP approach for data access using Supabase
 */
import { retrySupabaseQuery } from "@/lib/retry";

export class StudentService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Get student ID from username
   * @param {string} username - Username (could be email or user_id)
   * @returns {Promise<string|null>} Student UUID or null
   */
  async getStudentIdByUsername(username) {
    try {
      if (!username || username.trim() === "") {
        console.error("getStudentIdByUsername: Empty username provided");
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

      // Then get student_id from students table with retry
      try {
        const { data: studentData, error: studentError } = await retrySupabaseQuery(() =>
          this.supabase
            .from("students")
            .select("id, student_id")
            .eq("user_id", userData.id)
            .maybeSingle()
        );

        if (studentError) {
          const errorMessage = studentError.message || String(studentError);
          if (errorMessage.includes("fetch failed") || errorMessage.includes("Network error")) {
            throw new Error("Network error: Unable to connect to database. Please try again.");
          }
          console.error("Error fetching student:", studentError);
          return null;
        }

        if (!studentData) {
          console.error("Student record not found for user:", userData.id);
          return null;
        }

        return studentData.id; // Return the UUID 'id' for foreign key relations
      } catch (networkError) {
        console.error("Network error fetching student:", networkError);
        throw networkError;
      }
    } catch (exception) {
      console.error("Exception in getStudentIdByUsername:", exception);
      // Re-throw network errors so API routes can handle them
      if (exception.message && exception.message.includes("Network error")) {
        throw exception;
      }
      return null;
    }
  }

  /**
   * Get student profile information
   * @param {string} studentId - Student UUID
   * @returns {Promise<Object|null>} Student profile data
   */
  async getStudentProfile(studentId) {
    const { data, error } = await this.supabase
      .from("students")
      .select(
        `
        id,
        student_id,
        full_name,
        date_of_birth,
        class_level,
        created_at,
        users:user_id (
          email
        )
      `
      )
      .eq("id", studentId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching student profile:", error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      student_id: data.student_id || data.id,
      full_name: data.full_name,
      date_of_birth: data.date_of_birth || "",
      class_level: data.class_level || "",
      email: data.users?.email || "",
      created_at: data.created_at,
    };
  }

  /**
   * Get dashboard statistics for student
   * @param {string} studentId - Student UUID
   * @returns {Promise<Object>} Dashboard stats
   */
  async getDashboardStats(studentId) {
    // Get total enrolled classes
    const { data: enrollmentsData, error: enrollmentsError } =
      await this.supabase
        .from("enrollments")
        .select("class_id", { count: "exact" })
        .eq("student_id", studentId);

    if (enrollmentsError) {
      console.error("Error fetching enrollments count:", enrollmentsError);
    }

    const totalClasses = enrollmentsData?.length || 0;

    // Calculate GPA from student_scores
    // First get all exam_ids for classes the student is enrolled in
    const { data: enrollments, error: enrollmentsListError } =
      await this.supabase
        .from("enrollments")
        .select("class_id")
        .eq("student_id", studentId);

    if (enrollmentsListError) {
      console.error("Error fetching enrollments list:", enrollmentsListError);
    }

    let gpa = 0;
    if (enrollments && enrollments.length > 0) {
      const classIds = enrollments.map((e) => e.class_id);

      // Get exams for these classes
      const { data: examsData, error: examsError } = await this.supabase
        .from("exams")
        .select("id")
        .in("class_id", classIds);

      if (!examsError && examsData && examsData.length > 0) {
        const examIds = examsData.map((e) => e.id);

        // Get scores for these exams
        const { data: scoresData, error: scoresError } = await this.supabase
          .from("student_scores")
          .select("score")
          .eq("student_id", studentId)
          .in("exam_id", examIds);

        if (!scoresError && scoresData && scoresData.length > 0) {
          const validScores = scoresData
            .map((s) => parseFloat(s.score))
            .filter((s) => !isNaN(s));

          if (validScores.length > 0) {
            const sum = validScores.reduce((a, b) => a + b, 0);
            gpa = sum / validScores.length / 20; // Convert 0-100 scale to 0-5 GPA scale
          }
        }
      }
    }

    // Calculate attendance rate
    let attendanceRate = 0;
    if (enrollments && enrollments.length > 0) {
      const classIds = enrollments.map((e) => e.class_id);

      // Get all attendance records for this student in enrolled classes
      const { data: attendanceData, error: attendanceError } =
        await this.supabase
          .from("attendance")
          .select("status")
          .eq("student_id", studentId)
          .in("class_id", classIds);

      if (!attendanceError && attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter(
          (a) => a.status === "present"
        ).length;
        attendanceRate = (presentCount / attendanceData.length) * 100;
      }
    }

    return {
      totalClasses,
      gpa: gpa.toFixed(2),
      attendanceRate: attendanceRate.toFixed(0),
    };
  }

  /**
   * Get student timetable
   * @param {string} studentId - Student UUID
   * @param {string} semester - Semester (e.g., "1", "2")
   * @param {number} year - Academic year (e.g., 2025)
   * @returns {Promise<Array>} Array of timetable entries
   */
  async getStudentTimetable(studentId, semester, year, weekStart = null, weekEnd = null) {
    const semesterAliases = this.getSemesterAliases(semester);
    // First get classes the student is enrolled in for this semester and year
    const { data: enrollmentsData, error: enrollmentsError } =
      await this.supabase
        .from("enrollments")
        .select(
          `
        class_id,
        classes:class_id (
          id,
          semester,
          year
        )
      `
        )
        .eq("student_id", studentId);

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError);
      throw enrollmentsError;
    }

    if (!enrollmentsData || enrollmentsData.length === 0) {
      return [];
    }

    // Filter classes by semester and year
    const relevantClassIds = enrollmentsData
      .filter(
        (e) =>
          e.classes?.year === parseInt(year) &&
          semesterAliases.includes(e.classes?.semester)
      )
      .map((e) => e.class_id);

    if (relevantClassIds.length === 0) {
      return [];
    }

    // Get timetable entries for these classes
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
      .in("class_id", relevantClassIds);

    if (error) {
      console.error("Error fetching student timetable:", error);
      throw error;
    }

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

    const startStr = weekStart.toISOString().split("T")[0];
    const endStr = weekEnd.toISOString().split("T")[0];

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
      .in("class_id", relevantClassIds)
      .gte("override_date", startStr)
      .lte("override_date", endStr);

    const overridesMap =
      overrides?.reduce((acc, o) => {
        const key = `${o.class_id}-${o.override_date}`;
        acc[key] = o;
        return acc;
      }, {}) || {};

    const { data: exams } = await this.supabase
      .from("exams")
      .select("class_id, exam_date")
      .in("class_id", relevantClassIds)
      .gte("exam_date", startStr)
      .lte("exam_date", endStr);

    const examSet = new Set((exams || []).map((e) => `${e.class_id}-${e.exam_date}`));

    const results = [];
    for (const entry of data || []) {
      const dateForEntry = new Date(weekStart);
      dateForEntry.setDate(weekStart.getDate() + (entry.day_of_week - 1));
      const dateStr = dateForEntry.toISOString().split("T")[0];

      if (examSet.has(`${entry.class_id}-${dateStr}`)) continue;

      const ov = overridesMap[`${entry.class_id}-${dateStr}`];
      if (ov) {
        if (ov.action === "cancel") continue;
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

  getSemesterAliases(semester) {
    if (!semester) return [];
    const s = semester.toString().trim().toLowerCase();
    if (s === "fall" || s === "1") return ["Fall", "fall", "1"];
    if (s === "spring" || s === "2") return ["Spring", "spring", "2"];
    if (s === "summer" || s === "3") return ["Summer", "summer", "3"];
    return [semester];
  }

  /**
   * Get available semesters and years for a student
   * @param {string} studentId - Student UUID
   * @returns {Promise<Array>} Array of {semester, year} objects
   */
  async getAvailableSemesters(studentId) {
    const { data: enrollmentsData, error: enrollmentsError } =
      await this.supabase
        .from("enrollments")
        .select(
          `
        classes:class_id (
          semester,
          year
        )
      `
        )
        .eq("student_id", studentId);

    if (enrollmentsError) {
      console.error("Error fetching available semesters:", enrollmentsError);
      throw enrollmentsError;
    }

    // Extract unique semester/year combinations
    const semesters = new Set();
    (enrollmentsData || []).forEach((entry) => {
      if (entry.classes?.semester && entry.classes?.year) {
        semesters.add(`${entry.classes.semester}-${entry.classes.year}`);
      }
    });

    return Array.from(semesters).map((combo) => {
      const [semester, year] = combo.split("-");
      return { semester, year: parseInt(year) };
    });
  }

  /**
   * Get student attendance records
   * @param {string} studentId - Student UUID
   * @returns {Promise<Array>} Array of attendance records
   */
  async getStudentAttendance(studentId) {
    const { data, error } = await this.supabase
      .from("attendance")
      .select(
        `
        id,
        class_id,
        date,
        status,
        marked_by,
        classes:class_id (
          id,
          class_name,
          subjects:subject_id (
            name
          )
        )
      `
      )
      .eq("student_id", studentId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching student attendance:", error);
      throw error;
    }

    return (data || []).map((record) => ({
      id: record.id,
      class_id: record.class_id,
      class_name: record.classes?.class_name || "Unknown Class",
      subject_name: record.classes?.subjects?.name || "Unknown Subject",
      date: record.date,
      status: record.status,
      marked_by: record.marked_by,
    }));
  }

  /**
   * Get student enrolled classes
   * @param {string} studentId - Student UUID
   * @returns {Promise<Array>} Array of enrolled classes
   */
  async getStudentClasses(studentId) {
    const { data, error } = await this.supabase
      .from("enrollments")
      .select(`
        class_id,
        classes:class_id (
          id,
          class_name,
          semester,
          year,
          subjects:subject_id (
            id,
            name,
            code
          )
        )
      `)
      .eq("student_id", studentId);

    if (error) {
      console.error("Error fetching student classes:", error);
      throw error;
    }

    // Map and sort in JavaScript since we can't order by related table columns
    const classes = (data || []).map((enrollment) => ({
      class_id: enrollment.class_id,
      class_name: enrollment.classes?.class_name || "Unknown Class",
      subject_name: enrollment.classes?.subjects?.name || "Unknown Subject",
      subject_code: enrollment.classes?.subjects?.code || "",
      semester: enrollment.classes?.semester || "",
      year: enrollment.classes?.year || 0,
    }));

    // Sort by year (descending) then by semester (descending)
    classes.sort((a, b) => {
      if (b.year !== a.year) {
        return b.year - a.year;
      }
      // If years are equal, sort by semester (descending)
      return (b.semester || "").localeCompare(a.semester || "");
    });

    return classes;
  }

  /**
   * Get student attendance by class and section (1-15)
   * Section 1 = Week 1
   * @param {string} studentId - Student UUID
   * @param {string} classId - Class UUID
   * @param {string} semesterStartDate - Semester start date (YYYY-MM-DD)
   * @returns {Promise<Object>} Object with sections 1-15 as keys, each containing status
   */
  async getStudentAttendanceByClass(studentId, classId, semesterStartDate) {
    // Get all attendance for this class
    const { data, error } = await this.supabase
      .from("attendance")
      .select(`
        id,
        date,
        status
      `)
      .eq("student_id", studentId)
      .eq("class_id", classId)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching student attendance by class:", error);
      throw error;
    }

    // Calculate section (week) for each attendance record
    const startDate = new Date(semesterStartDate);
    const attendanceBySection = {};

    // Initialize sections 1-15 with default status
    for (let section = 1; section <= 15; section++) {
      attendanceBySection[section] = {
        status: null, // null means no attendance recorded
        records: []
      };
    }

    // Group attendance by section (week)
    (data || []).forEach((record) => {
      const recordDate = new Date(record.date);
      const diffTime = recordDate - startDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const section = Math.floor(diffDays / 7) + 1;

      if (section >= 1 && section <= 15) {
        attendanceBySection[section].records.push({
          id: record.id,
          date: record.date,
          status: record.status,
        });
      }
    });

    // Determine overall status for each section
    // If any record is present, status is "present"
    // If all records are absent, status is "absent"
    // If any record is late, status is "late" (unless all are absent)
    for (let section = 1; section <= 15; section++) {
      const records = attendanceBySection[section].records;
      if (records.length === 0) {
        attendanceBySection[section].status = null; // No attendance recorded
      } else {
        const hasPresent = records.some(r => r.status === "present");
        const hasLate = records.some(r => r.status === "late");
        const allAbsent = records.every(r => r.status === "absent");
        
        if (allAbsent) {
          attendanceBySection[section].status = "absent";
        } else if (hasLate) {
          attendanceBySection[section].status = "late";
        } else if (hasPresent) {
          attendanceBySection[section].status = "present";
        } else {
          attendanceBySection[section].status = "absent";
        }
      }
    }

    return attendanceBySection;
  }

  /**
   * Get student marks for a class
   * @param {string} studentId - Student UUID
   * @param {string} classId - Class UUID
   * @returns {Promise<Object>} Marks object with inclass, midterm, final, and final mark
   */
  async getStudentMarks(studentId, classId) {
    // Get all exams for this class
    const { data: examsData, error: examsError } = await this.supabase
      .from("exams")
      .select("id, exam_type, exam_date")
      .eq("class_id", classId);

    if (examsError) {
      console.error("Error fetching exams:", examsError);
      throw examsError;
    }

    if (!examsData || examsData.length === 0) {
      // Get class info even if no exams
      const { data: classData } = await this.supabase
        .from("classes")
        .select(`
          class_name,
          subjects:subject_id (
            name
          )
        `)
        .eq("id", classId)
        .maybeSingle();

      return {
        inclass: null,
        midterm: null,
        final: null,
        finalMark: null,
        class_name: classData?.class_name || "Unknown Class",
        subject_name: classData?.subjects?.name || "Unknown Subject",
      };
    }

    const examIds = examsData.map((e) => e.id);

    // Get student scores for these exams
    const { data: scoresData, error: scoresError } = await this.supabase
      .from("student_scores")
      .select(`
        exam_id,
        score,
        exams:exam_id (
          exam_type
        )
      `)
      .eq("student_id", studentId)
      .in("exam_id", examIds);

    if (scoresError) {
      console.error("Error fetching student scores:", scoresError);
      throw scoresError;
    }

    // Get class and subject info
    const { data: classData, error: classError } = await this.supabase
      .from("classes")
      .select(`
        class_name,
        subjects:subject_id (
          name
        )
      `)
      .eq("id", classId)
      .maybeSingle();

    if (classError) {
      console.error("Error fetching class info:", classError);
    }

    // Organize scores by exam type
    let inclassScore = null;
    let midtermScore = null;
    let finalScore = null;

    (scoresData || []).forEach((score) => {
      const examType = score.exams?.exam_type;
      const scoreValue = parseFloat(score.score);

      if (examType === "inclass") {
        inclassScore = scoreValue;
      } else if (examType === "midterm") {
        midtermScore = scoreValue;
      } else if (examType === "final") {
        finalScore = scoreValue;
      }
    });

    // Calculate final mark: 30% inclass + 30% midterm + 40% final
    let finalMark = null;
    if (inclassScore !== null && midtermScore !== null && finalScore !== null) {
      finalMark = inclassScore * 0.3 + midtermScore * 0.3 + finalScore * 0.4;
    }

    return {
      inclass: inclassScore,
      midterm: midtermScore,
      final: finalScore,
      finalMark: finalMark !== null ? parseFloat(finalMark.toFixed(2)) : null,
      class_name: classData?.class_name || "Unknown Class",
      subject_name: classData?.subjects?.name || "Unknown Subject",
    };
  }

  /**
   * Get student fees
   * @param {string} studentId - Student UUID
   * @returns {Promise<Array>} Array of fee records
   */
  async getStudentFees(studentId) {
    const { data, error } = await this.supabase
      .from("student_fees")
      .select("*")
      .eq("student_id", studentId)
      .order("due_date", { ascending: false });

    if (error) {
      console.error("Error fetching student fees:", error);
      throw error;
    }

    return (data || []).map((fee) => ({
      id: fee.id,
      amount: parseFloat(fee.amount),
      due_date: fee.due_date,
      paid: fee.paid || false,
      paid_at: fee.paid_at,
      created_at: fee.created_at,
    }));
  }

  /**
   * Get student exam schedule
   * @param {string} studentId - Student UUID
   * @returns {Promise<Array>} Array of exam records
   */
  async getStudentExamSchedule(studentId) {
    // First get classes the student is enrolled in
    const { data: enrollmentsData, error: enrollmentsError } =
      await this.supabase
        .from("enrollments")
        .select("class_id")
        .eq("student_id", studentId);

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError);
      throw enrollmentsError;
    }

    if (!enrollmentsData || enrollmentsData.length === 0) {
      return [];
    }

    const classIds = enrollmentsData.map((e) => e.class_id);

    // Get exams for these classes
    const { data, error } = await this.supabase
      .from("exams")
      .select(
        `
        id,
        exam_type,
        exam_date,
        classes:class_id (
          id,
          class_name,
          semester,
          year,
          subjects:subject_id (
            id,
            name,
            code
          )
        )
      `
      )
      .in("class_id", classIds)
      .order("exam_date", { ascending: true });

    if (error) {
      console.error("Error fetching student exam schedule:", error);
      throw error;
    }

    return (data || []).map((exam) => ({
      id: exam.id,
      exam_type: exam.exam_type,
      exam_date: exam.exam_date,
      class_name: exam.classes?.class_name || "Unknown Class",
      subject_name: exam.classes?.subjects?.name || "Unknown Subject",
      subject_code: exam.classes?.subjects?.code || "",
      semester: exam.classes?.semester || "",
      year: exam.classes?.year || "",
    }));
  }

  /**
   * Submit feedback
   * @param {string} studentId - Student UUID
   * @param {string} category - Feedback category (teacher, class, facility, suggestion, complaint, other)
   * @param {string} title - Feedback title (optional)
   * @param {string} message - Feedback message (required)
   * @param {boolean} isAnonymous - Whether feedback is anonymous
   * @returns {Promise<Object>} Created feedback record
   */
  async submitFeedback(studentId, category, title, message, isAnonymous = false) {
    // Validate category
    const validCategories = ['teacher', 'class', 'facility', 'suggestion', 'complaint', 'other'];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    if (!message || message.trim() === '') {
      throw new Error('Message is required');
    }

    const { data, error } = await this.supabase
      .from('feedback')
      .insert({
        student_id: studentId,
        category: category,
        title: title || null,
        message: message.trim(),
        is_anonymous: isAnonymous,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }

    return data;
  }
}
