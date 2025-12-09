/**
 * Admin Service - OOP approach for data access using Supabase
 */
import { retrySupabaseQuery } from "@/lib/retry";
import { PasswordUtil } from "@/lib/password";

export class AdminService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Get all feedback with optional filtering
   * @param {string} category - Optional category filter
   * @param {string} status - Optional status filter
   * @returns {Promise<Array>} Array of feedback records
   */
  async getAllFeedback(category = null, status = null) {
    let query = this.supabase
      .from("feedback")
      .select(
        `
        id,
        student_id,
        category,
        title,
        message,
        is_anonymous,
        status,
        priority,
        created_at,
        updated_at
      `
      )
      .order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching feedback:", error);
      throw error;
    }

    // Get unique student IDs that are not anonymous
    const studentIds = [
      ...new Set(
        (data || [])
          .filter((f) => !f.is_anonymous && f.student_id)
          .map((f) => f.student_id)
      ),
    ];

    // Fetch student data for non-anonymous feedback
    let studentsMap = {};
    if (studentIds.length > 0) {
      const { data: studentsData, error: studentsError } = await this.supabase
        .from("students")
        .select("id, full_name, student_id")
        .in("id", studentIds);

      if (!studentsError && studentsData) {
        studentsMap = studentsData.reduce((acc, student) => {
          acc[student.id] = {
            id: student.id,
            fullName: student.full_name,
            studentId: student.student_id,
          };
          return acc;
        }, {});
      }
    }

    return (data || []).map((feedback) => ({
      id: feedback.id,
      category: feedback.category,
      title: feedback.title,
      message: feedback.message,
      isAnonymous: feedback.is_anonymous,
      status: feedback.status,
      priority: feedback.priority || "medium", // Default to medium if not set
      createdAt: feedback.created_at,
      updatedAt: feedback.updated_at,
      student: feedback.is_anonymous
        ? null
        : feedback.student_id && studentsMap[feedback.student_id]
        ? studentsMap[feedback.student_id]
        : null,
    }));
  }

  /**
   * Update feedback priority
   * @param {string} feedbackId - Feedback UUID
   * @param {string} priority - Priority level (high, medium, low)
   * @returns {Promise<Object>} Updated feedback record
   */
  async updateFeedbackPriority(feedbackId, priority) {
    const validPriorities = ["high", "medium", "low"];
    if (!validPriorities.includes(priority)) {
      throw new Error(
        `Invalid priority. Must be one of: ${validPriorities.join(", ")}`
      );
    }

    const { data, error } = await this.supabase
      .from("feedback")
      .update({
        priority: priority,
        updated_at: new Date().toISOString(),
      })
      .eq("id", feedbackId)
      .select()
      .single();

    if (error) {
      console.error("Error updating feedback priority:", error);
      throw error;
    }

    return data;
  }

  /**
   * Update feedback status
   * @param {string} feedbackId - Feedback UUID
   * @param {string} status - Status (pending, in_review, resolved)
   * @returns {Promise<Object>} Updated feedback record
   */
  async updateFeedbackStatus(feedbackId, status) {
    const validStatuses = ["pending", "in_review", "resolved"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const { data, error } = await this.supabase
      .from("feedback")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", feedbackId)
      .select()
      .single();

    if (error) {
      console.error("Error updating feedback status:", error);
      throw error;
    }

    return data;
  }

  /**
   * Get feedback by ID
   * @param {string} feedbackId - Feedback UUID
   * @returns {Promise<Object>} Feedback record
   */
  async getFeedbackById(feedbackId) {
    const { data, error } = await this.supabase
      .from("feedback")
      .select(
        `
        id,
        student_id,
        category,
        title,
        message,
        is_anonymous,
        status,
        priority,
        created_at,
        updated_at
      `
      )
      .eq("id", feedbackId)
      .single();

    if (error) {
      console.error("Error fetching feedback:", error);
      throw error;
    }

    // Fetch student data if not anonymous
    let student = null;
    if (!data.is_anonymous && data.student_id) {
      const { data: studentData, error: studentError } = await this.supabase
        .from("students")
        .select("id, full_name, student_id")
        .eq("id", data.student_id)
        .single();

      if (!studentError && studentData) {
        student = {
          id: studentData.id,
          fullName: studentData.full_name,
          studentId: studentData.student_id,
        };
      }
    }

    return {
      id: data.id,
      category: data.category,
      title: data.title,
      message: data.message,
      isAnonymous: data.is_anonymous,
      status: data.status,
      priority: data.priority || "medium", // Default to medium if not set
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      student: student,
    };
  }

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats
   */
  async getDashboardStats() {
    // Get total students
    const { count: totalStudents, error: studentsError } = await this.supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    if (studentsError) {
      console.error("Error fetching students count:", studentsError);
    }

    // Get total staff
    const { count: totalStaff, error: staffError } = await this.supabase
      .from("staff")
      .select("*", { count: "exact", head: true });

    if (staffError) {
      console.error("Error fetching staff count:", staffError);
    }

    // Get total classes
    const { count: totalClasses, error: classesError } = await this.supabase
      .from("classes")
      .select("*", { count: "exact", head: true });

    if (classesError) {
      console.error("Error fetching classes count:", classesError);
    }

    // Get total subjects
    const { count: totalSubjects, error: subjectsError } = await this.supabase
      .from("subjects")
      .select("*", { count: "exact", head: true });

    if (subjectsError) {
      console.error("Error fetching subjects count:", subjectsError);
    }

    // Get total rooms
    const { count: totalRooms, error: roomsError } = await this.supabase
      .from("rooms")
      .select("*", { count: "exact", head: true });

    if (roomsError) {
      console.error("Error fetching rooms count:", roomsError);
    }

    // Get pending feedback
    const { count: pendingFeedback, error: feedbackError } = await this.supabase
      .from("feedback")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (feedbackError) {
      console.error("Error fetching pending feedback count:", feedbackError);
    }

    // Get unpaid fees
    const { count: unpaidFees, error: feesError } = await this.supabase
      .from("student_fees")
      .select("*", { count: "exact", head: true })
      .eq("paid", false);

    if (feesError) {
      console.error("Error fetching unpaid fees count:", feesError);
    }

    // Get unpaid salaries
    const { count: unpaidSalaries, error: salariesError } = await this.supabase
      .from("staff_salary")
      .select("*", { count: "exact", head: true })
      .eq("status", false);

    if (salariesError) {
      console.error("Error fetching unpaid salaries count:", salariesError);
    }

    return {
      totalStudents: totalStudents || 0,
      totalStaff: totalStaff || 0,
      totalClasses: totalClasses || 0,
      totalSubjects: totalSubjects || 0,
      totalRooms: totalRooms || 0,
      pendingFeedback: pendingFeedback || 0,
      unpaidFees: unpaidFees || 0,
      unpaidSalaries: unpaidSalaries || 0,
    };
  }

  /**
   * Get all students with optional filters
   * @param {string} searchQuery - Optional search query for name or student_id
   * @param {string} classLevel - Optional filter by class_level
   * @returns {Promise<Array>} Array of student records
   */
  async getAllStudents(searchQuery = null, classLevel = null) {
    let query = this.supabase
      .from("students")
      .select(
        "id, full_name, date_of_birth, class_level, student_id, created_at"
      )
      .order("full_name", { ascending: true });

    if (searchQuery) {
      query = query.or(
        `full_name.ilike.%${searchQuery}%,student_id.ilike.%${searchQuery}%`
      );
    }

    if (classLevel && classLevel !== "all") {
      query = query.eq("class_level", classLevel);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching students:", error);
      throw error;
    }

    return (data || []).map((student) => ({
      id: student.id,
      fullName: student.full_name,
      dateOfBirth: student.date_of_birth,
      classLevel: student.class_level,
      studentId: student.student_id,
      createdAt: student.created_at,
    }));
  }

  /**
   * Get student details with related data
   * @param {string} studentId - Student UUID
   * @returns {Promise<Object>} Student details with enrollments, scores, fees
   */
  async getStudentDetails(studentId) {
    // Get student basic info
    const { data: student, error: studentError } = await this.supabase
      .from("students")
      .select(
        "id, user_id, full_name, date_of_birth, class_level, student_id, created_at"
      )
      .eq("id", studentId)
      .single();

    if (studentError) {
      console.error("Error fetching student:", studentError);
      throw studentError;
    }

    // Get enrollments
    const { data: enrollments, error: enrollmentsError } = await this.supabase
      .from("enrollments")
      .select("class_id")
      .eq("student_id", studentId);

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError);
    }

    // Get classes for enrollments
    let classes = [];
    if (enrollments && enrollments.length > 0) {
      const classIds = enrollments.map((e) => e.class_id);
      const { data: classesData, error: classesError } = await this.supabase
        .from("classes")
        .select(
          `
          id,
          class_name,
          semester,
          year,
          subjects:subject_id (code, name),
          staff:staff_id (full_name, staff_id)
        `
        )
        .in("id", classIds);

      if (!classesError && classesData) {
        classes = classesData.map((c) => ({
          id: c.id,
          className: c.class_name,
          semester: c.semester,
          year: c.year,
          subject: c.subjects
            ? { code: c.subjects.code, name: c.subjects.name }
            : null,
          staff: c.staff
            ? { fullName: c.staff.full_name, staffId: c.staff.staff_id }
            : null,
        }));
      }
    }

    // Get fees
    const { data: fees, error: feesError } = await this.supabase
      .from("student_fees")
      .select("id, amount, due_date, paid, paid_at, created_at")
      .eq("student_id", studentId)
      .order("due_date", { ascending: false });

    if (feesError) {
      console.error("Error fetching fees:", feesError);
    }

    // Get attendance records
    const { data: attendance, error: attendanceError } = await this.supabase
      .from("attendance")
      .select("id, class_id, date, status, marked_by")
      .eq("student_id", studentId)
      .order("date", { ascending: false })
      .limit(50);

    if (attendanceError) {
      console.error("Error fetching attendance:", attendanceError);
    }

    // Get exam scores
    const { data: scores, error: scoresError } = await this.supabase
      .from("student_scores")
      .select(
        `
        id,
        score,
        exams:exam_id (
          id,
          exam_type,
          exam_date,
          classes:class_id (
            id,
            class_name,
            semester,
            year
          )
        )
      `
      )
      .eq("student_id", studentId);

    // Sort scores by exam date manually since nested order doesn't work
    if (scores && !scoresError) {
      scores.sort((a, b) => {
        const dateA = a.exams?.exam_date
          ? new Date(a.exams.exam_date)
          : new Date(0);
        const dateB = b.exams?.exam_date
          ? new Date(b.exams.exam_date)
          : new Date(0);
        return dateB - dateA;
      });
    }

    if (scoresError) {
      console.error("Error fetching scores:", scoresError);
    }

    return {
      id: student.id,
      userId: student.user_id,
      fullName: student.full_name,
      dateOfBirth: student.date_of_birth,
      classLevel: student.class_level,
      studentId: student.student_id,
      createdAt: student.created_at,
      enrollments: classes,
      fees: fees || [],
      attendance: attendance || [],
      scores: scores || [],
    };
  }

  /**
   * Get all staff with optional filters
   * @param {string} searchQuery - Optional search query for name or staff_id
   * @param {string} department - Optional filter by department
   * @returns {Promise<Array>} Array of staff records
   */
  async getAllStaff(searchQuery = null, department = null) {
    let query = this.supabase
      .from("staff")
      .select(
        "id, full_name, department, phone, hire_date, staff_id, created_at"
      )
      .order("full_name", { ascending: true });

    if (searchQuery) {
      query = query.or(
        `full_name.ilike.%${searchQuery}%,staff_id.ilike.%${searchQuery}%`
      );
    }

    if (department && department !== "all") {
      query = query.eq("department", department);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching staff:", error);
      throw error;
    }

    return (data || []).map((staff) => ({
      id: staff.id,
      fullName: staff.full_name,
      department: staff.department,
      phone: staff.phone,
      hireDate: staff.hire_date,
      staffId: staff.staff_id,
      createdAt: staff.created_at,
    }));
  }

  /**
   * Get staff details with related data
   * @param {string} staffId - Staff UUID
   * @returns {Promise<Object>} Staff details with classes and salaries
   */
  async getStaffDetails(staffId) {
    // Get staff basic info
    const { data: staff, error: staffError } = await this.supabase
      .from("staff")
      .select(
        "id, user_id, full_name, department, phone, hire_date, staff_id, created_at"
      )
      .eq("id", staffId)
      .single();

    if (staffError) {
      console.error("Error fetching staff:", staffError);
      throw staffError;
    }

    // Get classes taught
    const { data: classes, error: classesError } = await this.supabase
      .from("classes")
      .select(
        `
        id,
        class_name,
        semester,
        year,
        subjects:subject_id (code, name)
      `
      )
      .eq("staff_id", staffId)
      .order("year", { ascending: false })
      .order("semester", { ascending: true });

    if (classesError) {
      console.error("Error fetching classes:", classesError);
    }

    // Get salary records
    const { data: salaries, error: salariesError } = await this.supabase
      .from("staff_salary")
      .select("id, base_salary, bonus, month_year, status, created_at")
      .eq("staff_id", staffId)
      .order("month_year", { ascending: false });

    if (salariesError) {
      console.error("Error fetching salaries:", salariesError);
    }

    return {
      id: staff.id,
      userId: staff.user_id,
      fullName: staff.full_name,
      department: staff.department,
      phone: staff.phone,
      hireDate: staff.hire_date,
      staffId: staff.staff_id,
      createdAt: staff.created_at,
      classes: classes || [],
      salaries: salaries || [],
    };
  }

  /**
   * Get all classes with optional filters
   * @param {string} searchQuery - Optional search query for class_name
   * @param {string} semester - Optional filter by semester
   * @param {number} year - Optional filter by year
   * @returns {Promise<Array>} Array of class records
   */
  async getAllClasses(searchQuery = null, semester = null, year = null) {
    let query = this.supabase
      .from("classes")
      .select(
        `
        id,
        class_name,
        semester,
        year,
        created_at,
        subjects:subject_id (code, name),
        staff:staff_id (full_name, staff_id, department)
      `
      )
      .order("year", { ascending: false })
      .order("semester", { ascending: true })
      .order("class_name", { ascending: true });

    if (searchQuery) {
      query = query.ilike("class_name", `%${searchQuery}%`);
    }

    if (semester && semester !== "all") {
      const semesterAliases = this.getSemesterAliases(semester);
      query = query.in("semester", semesterAliases);
    }

    if (year) {
      query = query.eq("year", year);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching classes:", error);
      throw error;
    }

    // Get enrollment counts for each class
    const classesWithCounts = await Promise.all(
      (data || []).map(async (cls) => {
        const { count, error: enrollError } = await this.supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("class_id", cls.id);

        if (enrollError) {
          console.error("Error fetching enrollment count:", enrollError);
        }

        return {
          id: cls.id,
          className: cls.class_name,
          semester: cls.semester,
          year: cls.year,
          createdAt: cls.created_at,
          subject: cls.subjects
            ? { code: cls.subjects.code, name: cls.subjects.name }
            : null,
          staff: cls.staff
            ? {
                fullName: cls.staff.full_name,
                staffId: cls.staff.staff_id,
                department: cls.staff.department,
              }
            : null,
          enrollmentCount: count || 0,
        };
      })
    );

    return classesWithCounts;
  }

  /**
   * Get class details with related data
   * @param {string} classId - Class UUID
   * @returns {Promise<Object>} Class details with enrollments, timetable, exams
   */
  async getClassDetails(classId) {
    // Get class basic info
    const { data: classData, error: classError } = await this.supabase
      .from("classes")
      .select(
        `
        id,
        class_name,
        semester,
        year,
        created_at,
        subjects:subject_id (id, code, name),
        staff:staff_id (id, full_name, staff_id, department, phone)
      `
      )
      .eq("id", classId)
      .single();

    if (classError) {
      console.error("Error fetching class:", classError);
      throw classError;
    }

    // Get enrollments
    const { data: enrollments, error: enrollmentsError } = await this.supabase
      .from("enrollments")
      .select(
        `
        id,
        students:student_id (id, full_name, student_id, class_level)
      `
      )
      .eq("class_id", classId);

    if (enrollmentsError) {
      console.error("Error fetching enrollments:", enrollmentsError);
    }

    // Get timetable
    const { data: timetable, error: timetableError } = await this.supabase
      .from("timetable")
      .select(
        `
        id,
        day_of_week,
        start_time,
        end_time,
        rooms:room_id (id, room_name),
        staff:staff_id (id, full_name, staff_id)
      `
      )
      .eq("class_id", classId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (timetableError) {
      console.error("Error fetching timetable:", timetableError);
    }

    // Get exams
    const { data: exams, error: examsError } = await this.supabase
      .from("exams")
      .select("id, exam_type, exam_date")
      .eq("class_id", classId)
      .order("exam_date", { ascending: true });

    if (examsError) {
      console.error("Error fetching exams:", examsError);
    }

    // Get attendance summary
    const { data: attendance, error: attendanceError } = await this.supabase
      .from("attendance")
      .select("id, student_id, date, status")
      .eq("class_id", classId)
      .order("date", { ascending: false })
      .limit(100);

    if (attendanceError) {
      console.error("Error fetching attendance:", attendanceError);
    }

    return {
      id: classData.id,
      className: classData.class_name,
      semester: classData.semester,
      year: classData.year,
      createdAt: classData.created_at,
      subject: classData.subjects
        ? {
            id: classData.subjects.id,
            code: classData.subjects.code,
            name: classData.subjects.name,
          }
        : null,
      staff: classData.staff
        ? {
            id: classData.staff.id,
            fullName: classData.staff.full_name,
            staffId: classData.staff.staff_id,
            department: classData.staff.department,
            phone: classData.staff.phone,
          }
        : null,
      enrollments: (enrollments || []).map((e) => ({
        id: e.id,
        student: e.students
          ? {
              id: e.students.id,
              fullName: e.students.full_name,
              studentId: e.students.student_id,
              classLevel: e.students.class_level,
            }
          : null,
      })),
      timetable: timetable || [],
      exams: exams || [],
      attendance: attendance || [],
    };
  }

  /**
   * Helper to get semester aliases (similar to StaffService)
   */
  getSemesterAliases(semester) {
    if (!semester) return null;
    const sem = semester.toString().trim();
    if (sem === "Fall" || sem === "1") {
      return ["Fall", "fall", "1"];
    }
    if (sem === "Spring" || sem === "2") {
      return ["Spring", "spring", "2"];
    }
    if (sem === "Summer" || sem === "3") {
      return ["Summer", "summer", "3"];
    }
    return [semester];
  }

  /**
   * Get all rooms
   * @returns {Promise<Array>} Array of rooms
   */
  async getRooms() {
    const { data, error } = await this.supabase
      .from("rooms")
      .select("id, room_name")
      .order("room_name", { ascending: true });

    if (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }

    return data || [];
  }

  /**
   * Check if two time ranges overlap
   */
  timesOverlap(startA, endA, startB, endB) {
    if (!startA || !endA || !startB || !endB) return false;
    const parse = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const a1 = parse(startA);
    const a2 = parse(endA);
    const b1 = parse(startB);
    const b2 = parse(endB);
    return a1 < b2 && b1 < a2;
  }

  /**
   * Check room availability for a specific date/time
   * Considers timetable (weekly) and backup_room_assignment overrides.
   * @returns {Promise<{available: boolean, conflicts: Array}>}
   */
  async checkRoomAvailability(
    classId,
    roomId,
    overrideDate,
    startTime,
    endTime
  ) {
    const conflicts = [];
    if (!roomId || !overrideDate || !startTime || !endTime) {
      return {
        available: false,
        conflicts: [{ reason: "Missing parameters" }],
      };
    }

    const dateObj = new Date(overrideDate);
    const dayOfWeek = ((dateObj.getDay() + 6) % 7) + 1; // Monday=1 ... Sunday=7

    // 1) Timetable conflicts on same room/day
    const { data: timetableSlots, error: timetableError } = await this.supabase
      .from("timetable")
      .select("id, class_id, room_id, start_time, end_time")
      .eq("room_id", roomId)
      .eq("day_of_week", dayOfWeek);

    if (timetableError) {
      console.error(
        "Error fetching timetable for availability:",
        timetableError
      );
    }

    const candidateClassIds = (timetableSlots || [])
      .filter((t) =>
        this.timesOverlap(t.start_time, t.end_time, startTime, endTime)
      )
      .map((t) => t.class_id)
      .filter((cid) => cid !== classId);

    // 2) Overrides for those classes on that date (to see if they move away or cancel)
    let overridesByClass = {};
    if (candidateClassIds.length > 0) {
      const { data: overridesData } = await this.supabase
        .from("backup_room_assignment")
        .select("class_id, room_id, action, start_time, end_time")
        .eq("override_date", overrideDate)
        .in("class_id", candidateClassIds);

      overridesByClass =
        overridesData?.reduce((acc, o) => {
          acc[o.class_id] = o;
          return acc;
        }, {}) || {};
    }

    // Resolve timetable conflicts
    for (const slot of timetableSlots || []) {
      if (slot.class_id === classId) continue;
      if (
        !this.timesOverlap(slot.start_time, slot.end_time, startTime, endTime)
      )
        continue;

      const ov = overridesByClass[slot.class_id];
      if (ov) {
        if (ov.action === "cancel") continue;
        // If moved to another room, skip conflict
        if (ov.room_id && ov.room_id !== roomId) continue;
        // If override times are provided, check overlap with those times instead
        const ovStart = ov.start_time || slot.start_time;
        const ovEnd = ov.end_time || slot.end_time;
        if (!this.timesOverlap(ovStart, ovEnd, startTime, endTime)) continue;
      }

      conflicts.push({
        type: "timetable",
        classId: slot.class_id,
        startTime: slot.start_time,
        endTime: slot.end_time,
      });
    }

    // 3) Direct overrides already in the target room for that date
    const { data: roomOverrides, error: roomOverridesError } =
      await this.supabase
        .from("backup_room_assignment")
        .select("class_id, room_id, action, start_time, end_time")
        .eq("override_date", overrideDate)
        .eq("room_id", roomId);

    if (roomOverridesError) {
      console.error("Error fetching room overrides:", roomOverridesError);
    }

    for (const ov of roomOverrides || []) {
      if (ov.class_id === classId) continue; // same class, we're updating
      if (ov.action === "cancel") continue;
      const ovStart = ov.start_time || startTime;
      const ovEnd = ov.end_time || endTime;
      if (this.timesOverlap(ovStart, ovEnd, startTime, endTime)) {
        conflicts.push({
          type: "override",
          classId: ov.class_id,
          startTime: ov.start_time,
          endTime: ov.end_time,
        });
      }
    }

    // Enrich conflicts with class names
    const conflictClassIds = [
      ...new Set(conflicts.map((c) => c.classId).filter(Boolean)),
    ];
    let classMap = {};
    if (conflictClassIds.length > 0) {
      const { data: classData } = await this.supabase
        .from("classes")
        .select("id, class_name")
        .in("id", conflictClassIds);
      classMap =
        classData?.reduce((acc, c) => {
          acc[c.id] = c.class_name;
          return acc;
        }, {}) || {};
    }

    const conflictsDetailed = conflicts.map((c) => ({
      ...c,
      className: classMap[c.classId] || "Unknown class",
    }));

    return {
      available: conflictsDetailed.length === 0,
      conflicts: conflictsDetailed,
    };
  }

  /**
   * Upsert a room override for a specific date/time
   */
  async upsertRoomOverride({
    classId,
    roomId,
    overrideDate,
    startTime,
    endTime,
    action = "room_change",
    staffId = null,
    note = null,
    createdBy = null,
  }) {
    const payload = {
      class_id: classId,
      room_id: roomId,
      override_date: overrideDate,
      start_time: startTime,
      end_time: endTime,
      action,
      staff_id: staffId,
      note,
      created_by: createdBy,
    };

    const { data, error } = await this.supabase
      .from("backup_room_assignment")
      .upsert(payload, { onConflict: "class_id,override_date" })
      .select()
      .single();

    if (error) {
      console.error("Error upserting room override:", error);
      throw error;
    }

    return data;
  }

  /**
   * Update a student/staff profile fields (admin only).
   * @param {string} userId - UUID of the user (users.id mapped to students.user_id / staff.user_id)
   * @param {"student"|"staff"} role - Role to update
   * @param {object} updates - Allowed fields: fullName, phone, department, classLevel, dateOfBirth, studentCode, staffCode
   * @returns {Promise<object>} Updated record from the role table
   */
  async updateUserProfile(userId, role, updates = {}) {
    if (!userId) throw new Error("userId is required");
    if (!role || (role !== "student" && role !== "staff")) {
      throw new Error("role must be 'student' or 'staff'");
    }

    let table = "";
    let payload = {};

    if (role === "student") {
      table = "students";
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.classLevel !== undefined)
        payload.class_level = updates.classLevel;
      if (updates.dateOfBirth !== undefined)
        payload.date_of_birth = updates.dateOfBirth;
      if (updates.studentCode !== undefined)
        payload.student_id = updates.studentCode;
      if (updates.phone !== undefined) payload.phone = updates.phone;
    } else if (role === "staff") {
      table = "staff";
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.department !== undefined)
        payload.department = updates.department;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.hireDate !== undefined) payload.hire_date = updates.hireDate;
      if (updates.staffCode !== undefined) payload.staff_id = updates.staffCode;
    }

    if (!table || Object.keys(payload).length === 0) {
      throw new Error("No valid fields to update");
    }

    const { data, error } = await this.supabase
      .from(table)
      .update(payload)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${role} profile:`, error);
      throw error;
    }

    return data;
  }

  /**
   * Reset a user's password (admin only, no current password required).
   * @param {string} userId - UUID of the user (users.id)
   * @param {string} newPassword - Plain text new password
   * @returns {Promise<boolean>} success flag
   */
  async resetUserPassword(userId, newPassword) {
    if (!userId) throw new Error("userId is required");
    if (!newPassword || newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    const hashedPassword = await PasswordUtil.hashPassword(newPassword);

    const { error } = await this.supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("id", userId);

    if (error) {
      console.error("Error resetting user password:", error);
      throw error;
    }

    return true;
  }
}
