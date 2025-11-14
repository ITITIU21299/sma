/**
 * Staff Model - OOP approach
 */
export class Staff {
  constructor(
    staffId,
    name,
    email,
    phone,
    address,
    joiningDate,
    qualification
  ) {
    this.staffId = staffId;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.joiningDate = joiningDate;
    this.qualification = qualification;
  }

  getStaffId() {
    return this.staffId;
  }

  setStaffId(staffId) {
    this.staffId = staffId;
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

  getPhone() {
    return this.phone;
  }

  setPhone(phone) {
    this.phone = phone;
  }

  getAddress() {
    return this.address;
  }

  setAddress(address) {
    this.address = address;
  }

  getQualification() {
    return this.qualification;
  }

  setQualification(qualification) {
    this.qualification = qualification;
  }

  getJoiningDate() {
    return this.joiningDate;
  }

  setJoiningDate(joiningDate) {
    this.joiningDate = joiningDate;
  }

  toJSON() {
    return {
      staffId: this.staffId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      joiningDate: this.joiningDate,
      qualification: this.qualification,
    };
  }
}
