/**
 * Staff Service - OOP approach for data access using Supabase
 */
import { retrySupabaseQuery } from "@/lib/retry";

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
   * Normalize semester filter to support multiple labels
   * @param {string|null} semester
   * @returns {Array<string>|null}
   */
  getSemesterAliases(semester) {
    if (!semester) return null;
    const normalized = semester.toString().trim().toLowerCase();

    if (["fall", "1"].includes(normalized)) {
      return ["Fall", "fall", "1"];
    }
    if (["spring", "2"].includes(normalized)) {
      return ["Spring", "spring", "2"];
    }
    if (["summer", "3"].includes(normalized)) {
      return ["Summer", "summer", "3"];
    }
    return [semester];
  }

  /**
   * Get dashboard statistics for staff
   * @param {string} staffId - Staff UUID
   * @param {string} semester - Optional semester filter (e.g., "Fall", "1")
   * @param {number} year - Optional year filter (e.g., 2025)
   * @returns {Promise<Object>} Dashboard stats
   */
  async getDashboardStats(staffId, semester = null, year = null) {
    const semesterAliases = this.getSemesterAliases(semester);

    // Build query for classes
    let classesQuery = this.supabase
      .from("classes")
      .select("id", { count: "exact" })
      .eq("staff_id", staffId);

    // Filter by semester and year if provided
    if (semesterAliases) {
      classesQuery = classesQuery.in("semester", semesterAliases);
    }
    if (year) {
      classesQuery = classesQuery.eq("year", year);
    }

    const { data: classesData, error: classesError } = await classesQuery;

    if (classesError) {
      console.error("Error fetching classes count:", classesError);
    }

    const totalClasses = classesData?.length || 0;

    // Get classes list for student count
    let classesListQuery = this.supabase
      .from("classes")
      .select("id")
      .eq("staff_id", staffId);

    // Filter by semester and year if provided
    if (semesterAliases) {
      classesListQuery = classesListQuery.in("semester", semesterAliases);
    }
    if (year) {
      classesListQuery = classesListQuery.eq("year", year);
    }

    const { data: classesList, error: classesListError } = await classesListQuery;

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

      // Determine status based on boolean column:
      // NULL or FALSE => pending, TRUE => paid
      const isPaid = salary.status === true;

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

