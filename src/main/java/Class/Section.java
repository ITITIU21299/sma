package Class;

public class Section {
    private String id;
    private String name;
    private String group;
    private String year;
    private String semester;
    
    public Section(String id, String name, String group, String year, String semester){
        this.id = id;
        this.name = name;
        this.group = group;
        this.year = year;
        this.semester = semester;
    }
    
    public String getId(){
        return id;
    }
    public String getName(){
        return name;
    }
    
    public String getGroup(){
        return group;
    }
    
    public String getYear(){
        return year;
    }
    
    public String getSemester(){
        return semester;
    }
}
