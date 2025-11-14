package Class;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author nguye
 */
public class Staff {
    private static String staffId;
    private static String name;
    private static String email;
    private static String phone;
    private static String address;
    private static String qualification;
    private static String joiningDate;

    public String getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(String joiningDate) {
        Staff.joiningDate = joiningDate;
    }
    
    public Staff(){
        
    }

    public Staff(String staffId, String name, String email, String phone, String address, String joiningDate, String qualification) {
        this.staffId = staffId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.joiningDate = joiningDate;
        this.qualification = qualification;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String adress) {
        this.address = adress;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    
}
