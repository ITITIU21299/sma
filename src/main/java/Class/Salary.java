package Class;

import java.math.BigDecimal;

public class Salary {
    private String amount;
    private String month;
    private String year;
    private String date;
    private String status;
    
    public Salary (String amount, String month, String year, String date, String status){
        this.amount = amount;
        this.month = month;
        this.year = year;
        this.date = date;
        this.status = status;
    }
    
    public String getAmount(){
        return amount;
    }
    
    public String getMonth(){
        return month;
    }
    
    public String getYear(){
        return year;
    }
    
    public String getDate(){
        return date;
    }
    
    public String getStatus(){
        return status;
    }
    
}
