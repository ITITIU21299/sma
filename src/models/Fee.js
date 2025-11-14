/**
 * Fee Model - OOP approach
 */
export class Fee {
  constructor(semester, year, amount, dueDate, status) {
    this.semester = semester;
    this.year = year;
    this.amount = amount;
    this.dueDate = dueDate;
    this.status = status;
  }

  getSemester() {
    return this.semester;
  }

  getYear() {
    return this.year;
  }

  getAmount() {
    return this.amount;
  }

  getDate() {
    return this.dueDate;
  }

  getStatus() {
    return this.status;
  }

  toJSON() {
    return {
      semester: this.semester,
      year: this.year,
      amount: this.amount,
      dueDate: this.dueDate,
      status: this.status,
    };
  }
}
