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

public class StaffDropAllRooms extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        RoomScheduleDAO roomScheduleDAO = new RoomScheduleDAO();
        String[] scheduleIds = request.getParameterValues("scheduleIds");

        if (scheduleIds != null) {
            for (String scheduleId : scheduleIds) {
                roomScheduleDAO.dropAssignedRoom(scheduleId);
            }
        }

        response.sendRedirect(request.getContextPath() + "/StaffDropRoom");
    }

}
