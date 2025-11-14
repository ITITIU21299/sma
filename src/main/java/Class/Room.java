package Class;

public class Room {
    private String scheduleId;
    private String roomId;
    private String roomNumber;
    private String roomType;
    private String capacity;
    private String date;
    private String week;
    private String startTime;
    private String endTime;

    public Room(String sId, String roomId, String roomNumber, String roomType, String capacity, String stime, String etime){
        this.scheduleId = sId;
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.capacity = capacity;
        this.startTime = stime;
        this.endTime = etime;
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
    
    public String getCapacity(){
        return capacity;
    }
    
    public String getStartTime(){
        return startTime;
    }
    
    public String getEndTime(){
        return endTime;
    }
}