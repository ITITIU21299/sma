/**
 * Exam Model - OOP approach
 */
export class Exam {
  constructor(
    subject,
    date,
    week,
    startTime,
    endTime,
    room,
    semester,
    subjectYear,
    examType = "",
    className = ""
  ) {
    this.subject = subject;
    this.date = date;
    this.week = week;
    this.startTime = startTime;
    this.endTime = endTime;
    this.room = room;
    this.semester = semester;
    this.subjectYear = subjectYear;
    this.examType = examType;
    this.className = className;
  }

  getSubject() {
    return this.subject;
  }

  getDate() {
    return this.date;
  }

  getStartTime() {
    return this.startTime;
  }

  getEndTime() {
    return this.endTime;
  }

  getRoomNumber() {
    return this.room;
  }

  getRoom() {
    return this.room;
  }

  setRoom(room) {
    this.room = room;
  }

  getWeek() {
    return this.week;
  }

  setWeek(week) {
    this.week = week;
  }

  getSemester() {
    return this.semester;
  }

  setSemester(semester) {
    this.semester = semester;
  }

  getSubjectYear() {
    return this.subjectYear;
  }

  setSubjectYear(subjectYear) {
    this.subjectYear = subjectYear;
  }

  getExamType() {
    return this.examType;
  }

  getClassName() {
    return this.className;
  }

  toJSON() {
    return {
      subject: this.subject,
      date: this.date,
      week: this.week,
      startTime: this.startTime,
      endTime: this.endTime,
      room: this.room,
      semester: this.semester,
      subjectYear: this.subjectYear,
      examType: this.examType,
      className: this.className,
    };
  }
}
