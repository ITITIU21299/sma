package DAO;

import Util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import Class.*;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class StaffDAO {

    public int getNumberOfStudentsByStaffId(String staffid) {
        String query = "SELECT COUNT(DISTINCT ss.student_id) AS total_students "
                + "FROM StaffSections sf "
                + "JOIN StudentsSections ss ON sf.section_id = ss.section_id "
                + "WHERE sf.staff_id = ?;";
        try (Connection connection = DBUtil.getConnection(); PreparedStatement ps = connection.prepareStatement(query)) {

            ps.setString(1, staffid);
            ResultSet resultSet = ps.executeQuery();

            if (resultSet.next()) {
                return resultSet.getInt("total_students");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public List<Salary> getSalaryByStaffId(String id) {
        List<Salary> salaries = new ArrayList<>();
        String query = "SELECT amount, salary_month, salary_year, payment_date, status FROM StaffSalary WHERE staff_id = ?";

        try (Connection connection = DBUtil.getConnection(); PreparedStatement preparedStatement = connection.prepareStatement(query)) {

            preparedStatement.setString(1, id);

            try (ResultSet rs = preparedStatement.executeQuery()) {
                while (rs.next()) {
                    Salary s = new Salary(
                            rs.getString("amount"),
                            rs.getString("salary_month"),
                            rs.getString("salary_year"),
                            rs.getString("payment_date"),
                            rs.getString("status"));
                    salaries.add(s);
                }
                return salaries;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean updateStaffProfile(Staff staff) {
        String sql = "UPDATE Staff SET name = ?, email = ?, phone = ?, address = ? WHERE staff_id = ?";

        try (Connection conn = DBUtil.getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, staff.getName());
            stmt.setString(2, staff.getEmail());
            stmt.setString(3, staff.getPhone());
            stmt.setString(4, staff.getAddress());
            stmt.setString(5, staff.getStaffId());

            int rowsUpdated = stmt.executeUpdate();
            return rowsUpdated > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }

    }

    public Staff getStaffByUsername(String username) {
        String query = "SELECT * FROM Staff WHERE username = ?";

        try (Connection connection = DBUtil.getConnection(); PreparedStatement preparedStatement = connection.prepareStatement(query)) {

            preparedStatement.setString(1, username);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    return new Staff(
                            resultSet.getString("staff_id"),
                            resultSet.getString("name"),
                            resultSet.getString("email"),
                            resultSet.getString("phone"),
                            resultSet.getString("address"),
                            resultSet.getString("joining_date"),
                            resultSet.getString("qualification")
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Section> getSectionByStaffId(String staffId) {
        List<Section> sections = new ArrayList<>();
        String query = "SELECT s.section_id, s.section_group, sub.subject_name, sub.subject_year, sub.semester "
                + "FROM Sections s "
                + "JOIN StaffSections ss ON s.section_id = ss.section_id "
                + "JOIN Subjects sub ON s.subject_id = sub.subject_id "
                + "WHERE ss.staff_id = ?;";
        try (Connection connection = DBUtil.getConnection(); PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, staffId);
            try (ResultSet rs = preparedStatement.executeQuery()) {
                while (rs.next()) {
                    Section s = new Section(
                            rs.getString("section_id"),
                            rs.getString("subject_name"),
                            rs.getString("section_group"),
                            rs.getString("subject_year"),
                            rs.getString("semester"));
                    sections.add(s);
                }
                return sections;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Schedule> getRoomScheduleByStaffId(String id) {
        List<Schedule> schedules = new ArrayList<>();
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        LocalTime start, end;
        String query = "SELECT subject_name, section_group, room_number, schedule_date, start_time, end_time, week, semester, subject_year \n"
                + "FROM StaffSections ss \n"
                + "JOIN RoomSchedule rs, Rooms r, ScheduleAssignment sa, Sections se, Subjects su \n"
                + "WHERE ss.section_id = sa.section_exam_id \n"
                + "AND sa.roomschedule_id = rs.roomschedule_id \n"
                + "AND rs.room_id = r.room_id \n"
                + "AND ss.section_id = se.section_id \n"
                + "AND se.subject_id = su.subject_id \n"
                + "AND staff_id = ? \n"
                + "ORDER BY week, start_time;";

        try (Connection connection = DBUtil.getConnection(); PreparedStatement preparedStatement = connection.prepareStatement(query)) {

            preparedStatement.setString(1, id);

            try (ResultSet rs = preparedStatement.executeQuery()) {
                while (rs.next()) {
                    start = rs.getTime("start_time").toLocalTime();
                    end = rs.getTime("end_time").toLocalTime();

                    Schedule schedule = new Schedule(rs.getString("room_number"), rs.getString("section_group"), rs.getString("subject_name"), rs.getString("schedule_date"), rs.getString("week"), start.format(timeFormatter), end.format(timeFormatter), rs.getString("semester"), rs.getString("subject_year"));
                    schedules.add(schedule);
                    System.out.println(schedule.getWeek());
                }
                return schedules;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void updateStaffNameByUsername(String username, String fullName) {
        String query = "UPDATE Staff SET name = ? WHERE username = ?";
        try (Connection conn = DBUtil.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, fullName);
            stmt.setString(2, username);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void updateStaffEmailByUsername(String username, String email) {
        String query = "UPDATE Staff SET email = ? WHERE username = ?";
        try (Connection conn = DBUtil.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, email);
            stmt.setString(2, username);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void updateStaffPhoneByUsername(String username, String phone) {
        String query = "UPDATE Staff SET phone = ? WHERE username = ?";
        try (Connection conn = DBUtil.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, phone);
            stmt.setString(2, username);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void updateStaffAddressByUsername(String username, String address) {
        String query = "UPDATE Staff SET address = ? WHERE username = ?";
        try (Connection conn = DBUtil.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, address);
            stmt.setString(2, username);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public int getNumberOfClassByStaffId(String staffId) {
        int count = 0;
        String query = "SELECT COUNT(staff_section_id) FROM StaffSections WHERE staff_id = ?";

        try (Connection connection = DBUtil.getConnection(); PreparedStatement statement = connection.prepareStatement(query)) {

            statement.setString(1, staffId);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    count = resultSet.getInt(1);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return count;
    }
}
