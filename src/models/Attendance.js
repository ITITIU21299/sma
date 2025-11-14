/**
 * Attendance Model - OOP approach
 */
export class Attendance {
  constructor(assignmentId, studentId, sectionId, status) {
    this.assignmentId = assignmentId;
    this.studentId = studentId;
    this.sectionId = sectionId;
    this.status = status;
  }

  getSectionId() {
    return this.sectionId;
  }

  setSectionId(sectionId) {
    this.sectionId = sectionId;
  }

  getStudentId() {
    return this.studentId;
  }

  setStudentId(studentId) {
    this.studentId = studentId;
  }

  getAssignmentId() {
    return this.assignmentId;
  }

  setAssignmentId(assignmentId) {
    this.assignmentId = assignmentId;
  }

  getStatus() {
    return this.status;
  }

  setStatus(status) {
    this.status = status;
  }

  toJSON() {
    return {
      assignmentId: this.assignmentId,
      studentId: this.studentId,
      sectionId: this.sectionId,
      status: this.status,
    };
  }
}
