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
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      return null;
    }

    return new User(data.username, data.password, data.role);
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

    // Update password in database
    const { error } = await this.supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("username", username);

    return !error;
  }

  async createUser(username, password, role) {
    const hashedPassword = await PasswordUtil.hashPassword(password);

    const { data, error } = await this.supabase
      .from("users")
      .insert({
        username,
        password: hashedPassword,
        role,
      })
      .select()
      .single();

    if (error || !data) {
      return null;
    }

    return new User(data.username, data.password, data.role);
  }
}
