import { User } from "@/models/User";
import { PasswordUtil } from "@/lib/password";

/**
 * User Service - OOP approach for data access using Supabase
 * This will be used by API routes to interact with the database
 */
export class UserService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  async getUserByUsername(username) {
    try {
      if (!username || username.trim() === "") {
        console.error("getUserByUsername: Empty username provided");
        return null;
      }

      const trimmedUsername = username.trim();

      // Simple heuristic: if it contains @, treat as email, otherwise as user_id
      const isEmail = trimmedUsername.includes("@");

      let data = null;
      let error = null;

      if (isEmail) {
        // Query by email
        try {
          const { data: emailData, error: emailError } = await this.supabase
            .from("users")
            .select("id, email, password_hash, role, user_id")
            .eq("email", trimmedUsername)
            .maybeSingle();

          if (emailError) {
            console.error("Error querying by email:", emailError);
            error = emailError;
          } else if (emailData) {
            data = emailData;
            console.log("User found by email:", trimmedUsername);
          }
        } catch (emailException) {
          console.error("Exception querying by email:", emailException);
          error = emailException;
        }
      } else {
        // Query by user_id
        try {
          const { data: userIdData, error: userIdError } = await this.supabase
            .from("users")
            .select("id, email, password_hash, role, user_id")
            .eq("user_id", trimmedUsername)
            .maybeSingle();

          if (userIdError) {
            console.error("Error querying by user_id:", userIdError);
            error = userIdError;
          } else if (userIdData) {
            data = userIdData;
            console.log("User found by user_id:", trimmedUsername);
          }
        } catch (userIdException) {
          console.error("Exception querying by user_id:", userIdException);
          error = userIdException;
        }
      }

      // If not found with primary method, try the other method as fallback
      if (!data && !error) {
        if (isEmail) {
          // Already tried email, try user_id as fallback
          try {
            const { data: userIdData, error: userIdError } = await this.supabase
              .from("users")
              .select("id, email, password_hash, role, user_id")
              .eq("user_id", trimmedUsername)
              .maybeSingle();

            if (!userIdError && userIdData) {
              data = userIdData;
              console.log("User found by user_id (fallback):", trimmedUsername);
            }
          } catch (fallbackException) {
            console.error(
              "Exception in fallback query by user_id:",
              fallbackException
            );
          }
        } else {
          // Already tried user_id, try email as fallback
          try {
            const { data: emailData, error: emailError } = await this.supabase
              .from("users")
              .select("id, email, password_hash, role, user_id")
              .eq("email", trimmedUsername)
              .maybeSingle();

            if (!emailError && emailData) {
              data = emailData;
              console.log("User found by email (fallback):", trimmedUsername);
            }
          } catch (fallbackException) {
            console.error(
              "Exception in fallback query by email:",
              fallbackException
            );
          }
        }
      }

      if (error && !data) {
        // If we have an error and no data, check if it's a network error
        if (error.message && error.message.includes("fetch failed")) {
          console.error("Network error - Supabase connection issue:", error);
          throw error; // Re-throw network errors
        }
      }

      if (!data) {
        console.log("User not found for:", trimmedUsername);
        return null;
      }

      // Validate required fields
      if (!data.password_hash) {
        console.error(
          "User found but password_hash is missing for:",
          trimmedUsername
        );
        return null;
      }

      if (!data.role) {
        console.error("User found but role is missing for:", trimmedUsername);
        return null;
      }

      // Use email as the identifier (or user_id if email is not available)
      const identifier = data.email || data.user_id || trimmedUsername;
      // Use password_hash from database
      return new User(identifier, data.password_hash, data.role);
    } catch (exception) {
      console.error("Exception in getUserByUsername:", exception);
      // Re-throw network errors
      if (exception.message && exception.message.includes("fetch failed")) {
        throw exception;
      }
      return null;
    }
  }

  async changePassword(username, currentPassword, newPassword) {
    // First verify current password
    const user = await this.getUserByUsername(username);
    if (!user) {
      return false;
    }

    const isPasswordValid = await PasswordUtil.verifyPassword(
      currentPassword,
      user.getPassword()
    );

    if (!isPasswordValid) {
      return false;
    }

    // Hash new password
    const hashedPassword = await PasswordUtil.hashPassword(newPassword);

    // Update password in database - try email first, then user_id
    let { error } = await this.supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("email", username);

    if (error) {
      // If update by email failed, try user_id
      const { error: userIdError } = await this.supabase
        .from("users")
        .update({ password_hash: hashedPassword })
        .eq("user_id", username);

      if (userIdError) {
        return false;
      }
    }

    return true;
  }

  async createUser(username, password, role) {
    const hashedPassword = await PasswordUtil.hashPassword(password);

    // Determine if username is email or user_id
    const isEmail = username.includes("@");
    const insertData = {
      password_hash: hashedPassword,
      role,
    };

    if (isEmail) {
      insertData.email = username;
    } else {
      insertData.user_id = username;
    }

    const { data, error } = await this.supabase
      .from("users")
      .insert(insertData)
      .select()
      .maybeSingle();

    if (error || !data) {
      console.error("Error creating user:", error);
      return null;
    }

    // Use email or user_id as identifier
    const identifier = data.email || data.user_id || username;
    return new User(identifier, data.password_hash, data.role);
  }
}
