/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Class;

/**
 *
 * @author admin
 */
public class Fee {
    private int semester;
    private int year;
    private String amount;
    private String dueDate;
    private String status;
    
    public Fee (int semester, int year, String amount, String dueDate, String status) {
        this.semester = semester;
        this.year = year;
        this.amount = amount;
        this.dueDate = dueDate;
        this.status = status;
    }
    
    public int getSemester() {
        return semester;
    }

    public int getYear() {
        return year;
    }
    
    public String getAmount() {
        return amount;
    }
    
    public String getDate() {
        return dueDate;
    }
    
    public String getStatus() {
        return status;
    }
                
}
