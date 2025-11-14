package Servlet;

import Class.*;
import DAO.*;
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
import jakarta.servlet.http.HttpSession;
import static java.lang.System.out;
import java.util.*;

public class StaffSchedule extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect(request.getContextPath() + "/index.jsp");
            return;
        }
        User user = (User) session.getAttribute("user");

        StaffDAO staffDAO = new StaffDAO();
        Staff staff = staffDAO.getStaffByUsername(user.getUsername());

        List<Schedule> schedules = staffDAO.getRoomScheduleByStaffId(staff.getStaffId());
        request.setAttribute("schedules", schedules);

        String week = "1";
        String current_week = request.getParameter("current week");
        String current_se = request.getParameter("current se");
        String current_ye = request.getParameter("current ye");        
        String action = "";

        String semester_year = "";

        if (request.getParameter("action") != null) {
            action = request.getParameter("action");
        }
        if (action.equals("Go")) {
            if (!request.getParameter("week").equals("")) {
                week = request.getParameter("week");
                request.setAttribute("week", week);
            } else {
                request.setAttribute("week", current_week);
            }
            if (request.getParameter("semester year") != null) {
                semester_year = request.getParameter("semester year");
                String[] splited = semester_year.split("\\s+");
                request.setAttribute("se", splited[0]);
                request.setAttribute("ye", splited[1]);
            }
        } else {
            if (action.equals("Previous week")) {
                int tmp = Integer.parseInt(current_week);
                week = String.valueOf(tmp - 1);
                request.setAttribute("week", week);
                out.println("PREV WEEK: " + week);
            } else if (action.equals("Next week")) {
                int tmp = Integer.parseInt(current_week);
                week = String.valueOf(tmp + 1);
                request.setAttribute("week", week);
                out.println("NEXT WEEK: " + week);
            }
            request.setAttribute("se", current_se);
            request.setAttribute("ye", current_ye);       
            out.println(current_se);
            out.println(current_ye);
        }
        RequestDispatcher dispatcher = request.getRequestDispatcher("/staffschedule.jsp");
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
        processRequest(request, response);
    }

}
