import bcrypt from "bcryptjs";

/**
 * Password Utility - OOP approach with static methods
 */
export class PasswordUtil {
  static async hashPassword(plainPassword) {
    const saltRounds = 12;
    return await bcrypt.hash(plainPassword, saltRounds);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
