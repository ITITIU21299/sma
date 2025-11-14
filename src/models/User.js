/**
 * User Model - OOP approach
 */
export class User {
  constructor(username, password, role) {
    this.username = username;
    this.password = password;
    this.role = role;
  }

  getRole() {
    return this.role;
  }

  getUsername() {
    return this.username;
  }

  getPassword() {
    return this.password;
  }

  toJSON() {
    return {
      username: this.username,
      role: this.role,
    };
  }
}
