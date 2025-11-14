package DAO;

import Class.*;
import Util.DBUtil;
import static java.lang.Integer.parseInt;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RoomScheduleDAO {


    public List<Room> getAvailableRooms() {
        List<Room> rooms = new ArrayList<>();
        String query = "SELECT rs.roomschedule_id, r.room_id, r.room_number, r.room_type, r.capacity, "
                + "rs.start_time, rs.end_time "
                + "FROM RoomSchedule rs "
                + "LEFT JOIN ScheduleAssignment sa ON rs.roomschedule_id = sa.roomschedule_id "
                + "AND sa.schedule_date BETWEEN 2 AND 8 "
                + "AND sa.week BETWEEN 1 AND 15 "
                + "JOIN Rooms r ON rs.room_id = r.room_id "
                + "GROUP BY rs.roomschedule_id, r.room_id, r.room_number, r.room_type, r.capacity, rs.start_time, rs.end_time "
                + "HAVING COUNT(*) < 15 * 7 "
                + "OR COUNT(CASE WHEN sa.section_exam_id IS NULL THEN 1 END) >0 "
                + "ORDER BY "
                + "SUBSTRING_INDEX(rs.roomschedule_id, '_', 2), "
                + "CASE "
                + "WHEN rs.roomschedule_id LIKE '%_M%' THEN 1 "
                + "WHEN rs.roomschedule_id LIKE '%_A%' THEN 2 "
                + "ELSE 3 "
                + "END;";

        try (Connection connection = DBUtil.getConnection(); PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            try (ResultSet rs = preparedStatement.executeQuery()) {
                while (rs.next()) {
                    Room r = new Room(
                            rs.getString("roomschedule_id"),
                            rs.getString("room_id"),
                            rs.getString("room_number"),
                            rs.getString("room_type"),
                            rs.getString("capacity"),
                            rs.getString("start_time"),
                            rs.getString("end_time"));
                    rooms.add(r);
                }
                return rooms;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<AssignedRoom> getRoomByStaffId(String staffId) {
        List<AssignedRoom> rooms = new ArrayList<>();
        String query = "SELECT sa.roomschedule_id, r.room_id, r.room_number, r.room_type, r.capacity, "
                + "sa.schedule_date, sa.week, rs.start_time, rs.end_time, s.section_group, sub.subject_name FROM Rooms r "
                + "LEFT JOIN RoomSchedule rs ON r.room_id = rs.room_id "
                + "LEFT JOIN ScheduleAssignment sa ON sa.roomschedule_id = rs.roomschedule_id "
                + "LEFT JOIN Sections s ON s.section_id = sa.section_exam_id "
                + "LEFT JOIN Subjects sub ON sub.subject_id = s.subject_id "
                + "LEFT JOIN StaffSections ss ON sa.section_exam_id = ss.section_id "
                + "WHERE ss.staff_id = ? "
                + "ORDER BY "
                + "SUBSTRING_INDEX(rs.roomschedule_id, '_', 2), "
                + "CASE "
                + "WHEN rs.roomschedule_id LIKE '%_M%' THEN 1 "
                + "WHEN rs.roomschedule_id LIKE '%_A%' THEN 2 "
                + "ELSE 3 "
                + "END, "
                + "sa.week ASC, "
                + "sa.schedule_date ASC";
        try (Connection connection = DBUtil.getConnection(); PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, staffId);
            try (ResultSet rs = preparedStatement.executeQuery()) {
                while (rs.next()) {
                    AssignedRoom r = new AssignedRoom(
                            rs.getString("roomschedule_id"),
                            rs.getString("room_id"),
                            rs.getString("room_number"),
                            rs.getString("room_type"),
                            rs.getString("schedule_date"),
                            rs.getString("week"),
                            rs.getString("capacity"),
                            rs.getString("start_time"),
                            rs.getString("end_time"),
                            rs.getString("section_group"),
                            rs.getString("subject_name"));
                    rooms.add(r);
                }
                return rooms;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

//    public String assignSectionToRoom(String roomScheduleId, String sectionId, String[] weekdays, String[] weeks) {
//        StringBuilder resultMessage = new StringBuilder();
//        boolean success = false;
//
//        // Check if the room is available for the specified weekdays
//        String availabilityQuery = "SELECT * FROM RoomSchedule WHERE roomschedule_id = ? AND section_exam_id IS NULL";
//        try (Connection connection = DBUtil.getConnection(); PreparedStatement preparedStatement = connection.prepareStatement(availabilityQuery)) {
//
//            preparedStatement.setString(1, roomScheduleId);
//            ResultSet resultSet = preparedStatement.executeQuery();
//
//            if (resultSet.next()) {
//                // Room is available, proceed to assign section
//                String updateQuery = "UPDATE RoomSchedule SET section_id = ? WHERE roomschedule_id = ?";
//                try (PreparedStatement updateStatement = connection.prepareStatement(updateQuery)) {
//                    updateStatement.setString(1, sectionId);
//                    updateStatement.setString(2, roomScheduleId);
//                    int rowsUpdated = updateStatement.executeUpdate();
//
//                    if (rowsUpdated > 0) {
//                        success = true;
//                        resultMessage.append("Section assigned to room successfully for week(s): ").append(String.join(", ", weeks)).append(". ");
//                    }
//                }
//
//                // Handle weeks assignment
//                for (String week : weeks) {
//                    String weekCheckQuery = "SELECT * FROM RoomSchedule WHERE week = ? AND section_exam_id IS NOT NULL";
//                    try (PreparedStatement weekCheckStmt = connection.prepareStatement(weekCheckQuery)) {
//                        weekCheckStmt.setString(1, week);
//                        ResultSet weekResult = weekCheckStmt.executeQuery();
//
//                        if (weekResult.next()) {
//                            resultMessage.append("Week ").append(week).append(" cannot be assigned because it's already booked. ");
//                        } else {
//                            // If no conflicting schedule, assign the room to the week
//                            String assignWeekQuery = "INSERT INTO RoomSchedule (roomschedule_id, section_id, week) VALUES (?, ?, ?)";
//                            try (PreparedStatement assignWeekStmt = connection.prepareStatement(assignWeekQuery)) {
//                                assignWeekStmt.setString(1, roomScheduleId);
//                                assignWeekStmt.setString(2, sectionId);
//                                assignWeekStmt.setString(3, week);
//                                assignWeekStmt.executeUpdate();
//                            }
//                        }
//                    }
//                }
//            } else {
//                // No room available for assignment, so create a new room for the given weeks
//                String createRoomQuery = "INSERT INTO RoomSchedule (section_id, week) VALUES (?, ?)";
//                for (String week : weeks) {
//                    try (PreparedStatement createRoomStmt = connection.prepareStatement(createRoomQuery)) {
//                        createRoomStmt.setString(1, sectionId);
//                        createRoomStmt.setString(2, week);
//                        createRoomStmt.executeUpdate();
//                        resultMessage.append("New room created and section assigned for week ").append(week).append(". ");
//                    }
//                }
//            }
//        } catch (SQLException e) {
//            e.printStackTrace();
//            return null;
//        }
//
//        if (success) {
//            return resultMessage.toString();
//        } else {
//            return null;
//        }
//    }
    public boolean assignSectionToRoomOrCreate(String roomScheduleId, String sectionId, int weekday, int week) {
        String checkQuery = "SELECT sa.assignment_id, sa.section_exam_id "
                + "FROM ScheduleAssignment sa "
                + "WHERE sa.roomschedule_id = ? AND sa.schedule_date = ? AND sa.week = ?";
        String insertQuery = "INSERT INTO ScheduleAssignment (assignment_id, roomschedule_id, schedule_date, week, section_exam_id) "
                + "VALUES (?, ?, ?, ?, ?)";
        String updateQuery = "UPDATE ScheduleAssignment SET section_exam_id = ? "
                + "WHERE roomschedule_id = ? AND schedule_date = ? AND week = ?";

        try (Connection connection = DBUtil.getConnection(); PreparedStatement checkStatement = connection.prepareStatement(checkQuery)) {

            checkStatement.setString(1, roomScheduleId);
            checkStatement.setInt(2, weekday);
            checkStatement.setInt(3, week);

            try (ResultSet resultSet = checkStatement.executeQuery()) {
                if (resultSet.next()) {
                    String sectionExamId = resultSet.getString("section_exam_id");
                    String assignmentId = resultSet.getString("assignment_id");
                    if (sectionExamId == null && assignmentId != null) {
                        try (PreparedStatement updateStatement = connection.prepareStatement(updateQuery)) {
                            updateStatement.setString(1, sectionId);
                            updateStatement.setString(2, roomScheduleId);
                            updateStatement.setInt(3, weekday);
                            updateStatement.setInt(4, week);
                            return updateStatement.executeUpdate() > 0;
                        }
                    } else if (sectionExamId != null && assignmentId != null) {
                        return false;
                    }
                } else {
                    String assignmentId = roomScheduleId + "_" + weekday + "_" + week;
                    try (PreparedStatement insertStatement = connection.prepareStatement(insertQuery)) {
                        insertStatement.setString(1, assignmentId);
                        insertStatement.setString(2, roomScheduleId);
                        insertStatement.setInt(3, weekday);
                        insertStatement.setInt(4, week);
                        insertStatement.setString(5, sectionId);
                        return insertStatement.executeUpdate() > 0;
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
        return false;
    }
    
    public String getAssignmentId(String date, String week, String sectionId) throws SQLException {
        String query = "SELECT assignment_id FROM ScheduleAssignment WHERE schedule_date = ? AND week = ? AND section_exam_id = ?";
        String assignmentId = "";
        try (Connection conn = DBUtil.getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, parseInt(date));
            stmt.setInt(2, parseInt(week));
            stmt.setString(3, sectionId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    assignmentId = rs.getString("assignment_id");
                }
                return assignmentId;
            } 

        }catch (SQLException e) {
                e.printStackTrace();
            }
            return null;
    }

    public void dropAssignedRoom(String scheduleId) {
        String query = "UPDATE ScheduleAssignment SET section_exam_id = NULL WHERE roomschedule_id = ?";
        try (Connection connection = DBUtil.getConnection(); PreparedStatement ps = connection.prepareStatement(query)) {
            ps.setString(1, scheduleId);
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
