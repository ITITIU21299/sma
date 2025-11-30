/**
 * Staff Service - OOP approach for data access using Supabase
 */
export class StaffService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
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
   * Get staff profile information
   * @param {string} staffId - Staff UUID
   * @returns {Promise<Object|null>} Staff profile data
   */
  async getStaffProfile(staffId) {
    const { data, error } = await this.supabase
      .from("staff")
      .select(`
        id,
        staff_id,
        full_name,
        department,
        phone,
        hire_date,
        created_at,
        users:user_id (
          email
        )
      `)
      .eq("id", staffId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching staff profile:", error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      staff_id: data.staff_id || "",
      full_name: data.full_name,
      department: data.department || "",
      phone: data.phone || "",
      email: data.users?.email || "",
      hire_date: data.hire_date || "",
      created_at: data.created_at,
    };
  }

  /**
   * Get dashboard statistics for staff
   * @param {string} staffId - Staff UUID
   * @returns {Promise<Object>} Dashboard stats
   */
  async getDashboardStats(staffId) {
    // Get total classes
    const { data: classesData, error: classesError } = await this.supabase
      .from("classes")
      .select("id", { count: "exact" })
      .eq("staff_id", staffId);

    if (classesError) {
      console.error("Error fetching classes count:", classesError);
    }

    const totalClasses = classesData?.length || 0;

    // Get total students enrolled in staff's classes
    const { data: classesList, error: classesListError } = await this.supabase
      .from("classes")
      .select("id")
      .eq("staff_id", staffId);

    if (classesListError) {
      console.error("Error fetching classes list:", classesListError);
    }

    let totalStudents = 0;
    if (classesList && classesList.length > 0) {
      const classIds = classesList.map((c) => c.id);
      const { data: enrollmentsData, error: enrollmentsError } =
        await this.supabase
          .from("enrollments")
          .select("student_id", { count: "exact" })
          .in("class_id", classIds);

      if (!enrollmentsError && enrollmentsData) {
        // Count unique students
        const uniqueStudents = new Set(
          enrollmentsData.map((e) => e.student_id)
        );
        totalStudents = uniqueStudents.size;
      }
    }

    return {
      totalClasses,
      totalStudents,
    };
  }

  /**
   * Get staff salary records
   * @param {string} staffId - Staff UUID
   * @returns {Promise<Array>} Array of salary records
   */
  async getStaffSalaries(staffId) {
    const { data, error } = await this.supabase
      .from("staff_salary")
      .select("*")
      .eq("staff_id", staffId)
      .order("month_year", { ascending: false });

    if (error) {
      console.error("Error fetching staff salaries:", error);
      throw error;
    }

    return (data || []).map((salary) => {
      const date = new Date(salary.month_year);
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();

      // Determine status based on current date
      const today = new Date();
      const isPaid = salary.month_year <= today;

      return {
        id: salary.id,
        amount: parseFloat(salary.base_salary) + parseFloat(salary.bonus || 0),
        month,
        year: year.toString(),
        date: salary.month_year,
        status: isPaid ? "paid" : "pending",
      };
    });
  }

  /**
   * Get classes taught by staff
   * @param {string} staffId - Staff UUID
   * @returns {Promise<Array>} Array of classes
   */
  async getStaffClasses(staffId) {
    const { data, error } = await this.supabase
      .from("classes")
      .select(`
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
      `)
      .eq("staff_id", staffId)
      .order("year", { ascending: false })
      .order("semester", { ascending: false });

    if (error) {
      console.error("Error fetching staff classes:", error);
      throw error;
    }

    return (data || []).map((cls) => ({
      id: cls.id,
      class_name: cls.class_name,
      semester: cls.semester,
      year: cls.year,
      subject_name: cls.subjects?.name || "Unknown Subject",
      subject_code: cls.subjects?.code || "",
    }));
  }
}

