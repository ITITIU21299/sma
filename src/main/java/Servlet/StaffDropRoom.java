package Servlet;

import Class.*;
import DAO.*;
import Util.*;
import jakarta.servlet.RequestDispatcher;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.sql.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import com.mysql.cj.conf.PropertyKey;
import jakarta.servlet.http.HttpSession;
import java.util.HashSet;
import java.util.List;

@WebServlet(name = "StaffDropRoom", urlPatterns = {"/StaffDropRoom"})
public class StaffDropRoom extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        RoomScheduleDAO roomScheduleDAO = new RoomScheduleDAO();
        HttpSession session = request.getSession(false);
        User user = (User) session.getAttribute("user");

        StaffDAO staffDAO = new StaffDAO();
        Staff staff = staffDAO.getStaffByUsername(user.getUsername());

        List<AssignedRoom> assignedRooms = roomScheduleDAO.getRoomByStaffId(staff.getStaffId());

        request.setAttribute("assignedRooms", assignedRooms);

        RequestDispatcher dispatcher = request.getRequestDispatcher("/staffsectionmanagement.jsp");
        dispatcher.forward(request, response);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String roomscheduleId = request.getParameter("scheduleId");
        String date = request.getParameter("date");
        String week = request.getParameter("week");
        String start = request.getParameter("start");
        String end = request.getParameter("end");

        if (roomscheduleId == null || roomscheduleId.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Schedule ID is required");
            return;
        }
        if (date == null || date.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Date is required");
            return;
        }
        if (week == null || week.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Week is required");
            return;
        }
        if (start == null || start.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Start time is required");
            return;
        }
        if (end == null || end.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "End time is required");
            return;
        }

        boolean isDropped = dropRoomSchedule(Integer.parseInt(date), Integer.parseInt(week), roomscheduleId, start, end);

        if (!isDropped) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to drop the room schedule");
        } else {
            processRequest(request, response);
        }
    }

    private boolean dropRoomSchedule(int date, int week, String roomscheduleId, String start, String end) {
        String query = "UPDATE ScheduleAssignment sa \n"
                + "JOIN RoomSchedule rs \n"
                + "SET sa.section_exam_id = NULL \n"
                + "WHERE sa.roomschedule_id = rs.roomschedule_id \n"
                + "AND rs.roomschedule_id = ? \n"
                + "AND sa.week = ? \n"
                + "AND sa.schedule_date = ? \n"
                + "AND rs.start_time = ? \n"
                + "AND rs.end_time = ? ;";

        try (Connection connection = DBUtil.getConnection(); PreparedStatement preparedStatement = connection.prepareStatement(query)) {

            preparedStatement.setString(1, roomscheduleId);
            preparedStatement.setInt(2, week);
            preparedStatement.setInt(3, date);
            preparedStatement.setString(4, start);
            preparedStatement.setString(5, end);

            int rowsUpdated = preparedStatement.executeUpdate();
            return rowsUpdated > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
