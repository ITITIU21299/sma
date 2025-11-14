/**
 * Student Model - OOP approach
 */
export class Student {
  constructor(
    studentId,
    name,
    email,
    dateOfBirth,
    gender,
    classId,
    academicYear,
    username = null
  ) {
    this.studentId = studentId;
    this.name = name;
    this.email = email;
    this.dateOfBirth = dateOfBirth;
    this.gender = gender;
    this.classId = classId;
    this.academicYear = academicYear;
    this.username = username;
  }

  getStudentId() {
    return this.studentId;
  }

  setStudentId(studentId) {
    this.studentId = studentId;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getEmail() {
    return this.email;
  }

  setEmail(email) {
    this.email = email;
  }

  getDateOfBirth() {
    return this.dateOfBirth;
  }

  setDateOfBirth(dateOfBirth) {
    this.dateOfBirth = dateOfBirth;
  }

  getGender() {
    return this.gender;
  }

  setGender(gender) {
    this.gender = gender;
  }

  getClassId() {
    return this.classId;
  }

  setClassId(classId) {
    this.classId = classId;
  }

  getAcademicYear() {
    return this.academicYear;
  }

  setAcademicYear(academicYear) {
    this.academicYear = academicYear;
  }

  getUsername() {
    return this.username;
  }

  setUsername(username) {
    this.username = username;
  }

  toJSON() {
    return {
      studentId: this.studentId,
      name: this.name,
      email: this.email,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      classId: this.classId,
      academicYear: this.academicYear,
      username: this.username,
    };
  }
}
