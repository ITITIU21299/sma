package Class;

public class Exam {
    private String subject;
    private String date;
    private String startTime;
    private String endTime;
    private String room;
    private String week;
    private String semester;
    private String subject_year;
    
    public Exam (String subject, String date, String week, String startTime, String endTime, String room, String semester, String subject_year) {
        this.subject = subject;
        this.date = date;
        this.week = week;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
        this.semester = semester;
        this.subject_year = subject_year;        
    }

    public String getSubject() {
        return subject;
    }
    
    public String getDate() {
        return date;
    }
    
    public String getStartTime() {
        return startTime;
    }
    
    public String getEndTime() {
        return endTime;
    }
    
    public String getRoomNumber() {
        return room;
    }    

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public String getWeek() {
        return week;
    }

    public void setWeek(String week) {
        this.week = week;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public String getSubject_year() {
        return subject_year;
    }

    public void setSubject_year(String subject_year) {
        this.subject_year = subject_year;
    }
    
}
