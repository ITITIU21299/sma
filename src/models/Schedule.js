/**
 * Schedule Model - OOP approach
 */
export class Schedule {
  constructor(
    roomId,
    sectionGroup,
    subjectName,
    scheduleDate,
    week,
    startTime,
    endTime,
    semester,
    subjectYear
  ) {
    this.roomId = roomId;
    this.sectionGroup = sectionGroup;
    this.subjectName = subjectName;
    this.scheduleDate = scheduleDate;
    this.week = week;
    this.startTime = startTime;
    this.endTime = endTime;
    this.semester = semester;
    this.subjectYear = subjectYear;
  }

  getRoomId() {
    return this.roomId;
  }

  setRoomId(roomId) {
    this.roomId = roomId;
  }

  getSectionGroup() {
    return this.sectionGroup;
  }

  setSectionGroup(sectionGroup) {
    this.sectionGroup = sectionGroup;
  }

  getSubjectName() {
    return this.subjectName;
  }

  setSubjectName(subjectName) {
    this.subjectName = subjectName;
  }

  getScheduleDate() {
    return this.scheduleDate;
  }

  setScheduleDate(scheduleDate) {
    this.scheduleDate = scheduleDate;
  }

  getWeek() {
    return this.week;
  }

  setWeek(week) {
    this.week = week;
  }

  getStartTime() {
    return this.startTime;
  }

  setStartTime(startTime) {
    this.startTime = startTime;
  }

  getEndTime() {
    return this.endTime;
  }

  setEndTime(endTime) {
    this.endTime = endTime;
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

  toJSON() {
    return {
      roomId: this.roomId,
      sectionGroup: this.sectionGroup,
      subjectName: this.subjectName,
      scheduleDate: this.scheduleDate,
      week: this.week,
      startTime: this.startTime,
      endTime: this.endTime,
      semester: this.semester,
      subjectYear: this.subjectYear,
    };
  }
}
