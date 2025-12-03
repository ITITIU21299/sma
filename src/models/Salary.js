/**
 * Salary Model - OOP approach
 */
export class Salary {
  constructor(amount, month, year, date, status) {
    this.amount = amount
    this.month = month
    this.year = year
    this.date = date
    this.status = status
  }

  getAmount() {
    return Number(this.amount).toFixed(2)
  }

  getMonth() {
    return this.month
  }

  getYear() {
    return this.year
  }

  getDate() {
    return this.date
  }

  getStatus() {
    return this.status
  }

  toJSON() {
    return {
      amount: this.amount,
      month: this.month,
      year: this.year,
      date: this.date,
      status: this.status,
    }
  }
}
