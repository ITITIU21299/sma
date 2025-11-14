package Class;

public class AssignedRoom {
    private String scheduleId;
    private String roomId;
    private String roomNumber;
    private String roomType;
    private String date;
    private String week;
    private String capacity;
    private String startTime;
    private String endTime;
    private String group;
    private String subjectName;

    public AssignedRoom(String sId, String roomId, String roomNumber, String roomType, String date, String week, String capacity, String stime, String etime, String group, String sname){
        this.scheduleId = sId;
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.date = date;
        this.week = week;
        this.capacity = capacity;
        this.startTime = stime;
        this.endTime = etime;
        this.group = group;
        this.subjectName = sname;
    }
    
    public String getScheduleId(){
        return scheduleId;
    }
    public String getId(){
        return roomId;
    }
    
    public String getNumber(){
        return roomNumber;
    }
    
    public String getType(){
        return roomType;
    }
    
    public String getDate(){
        return date;
    }
    
    public String getWeek(){
        return week;
    }
    
    public String getCapacity(){
        return capacity;
    }
    
    public String getStartTime(){
        return startTime;
    }
    
    public String getEndTime(){
        return endTime;
    }
    
    public String getGroup(){
        return group;
    }

    public String getSubjectName(){
        return subjectName;
    }
}