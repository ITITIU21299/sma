/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Class;

import java.sql.Time;
import java.time.LocalTime;

/**
 *
 * @author admin
 */
public class Schedule {

    private String room_id;
    private String section_group;
    private String subject_name;
    private String schedule_date;
    private String week;
    private String start_time;
    private String end_time;
    private String semester;
    private String subject_year;

    public Schedule() {
    }

    public Schedule(String room_id, String section_group, String subject_name, String schedule_date, String week, String start_time, String end_time, String semester, String subject_year) {
        this.room_id = room_id;
        this.section_group = section_group;
        this.subject_name = subject_name;
        this.schedule_date = schedule_date;
        this.week = week;
        this.start_time = start_time;
        this.end_time = end_time;
        this.semester = semester;
        this.subject_year = subject_year;
    }

    public String getRoom_id() {
        return room_id;
    }

    public void setRoom_id(String room_id) {
        this.room_id = room_id;
    }

    public String getSection_group() {
        return section_group;
    }

    public void setSection_group(String section_group) {
        this.section_group = section_group;
    }

    public String getSubject_name() {
        return subject_name;
    }

    public void setSubject_name(String subject_name) {
        this.subject_name = subject_name;
    }

    public String getSchedule_date() {
        return schedule_date;
    }

    public void setSchedule_date(String schedule_date) {
        this.schedule_date = schedule_date;
    }

    public String getWeek() {
        return week;
    }

    public void setWeek(String week) {
        this.week = week;
    }

    public String getStart_time() {
        return start_time;
    }

    public void setStart_time(String start_time) {
        this.start_time = start_time;
    }

    public String getEnd_time() {
        return end_time;
    }

    public void setEnd_time(String end_time) {
        this.end_time = end_time;
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
