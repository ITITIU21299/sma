package Servlet;

import Class.Section;
import Class.Staff;
import Class.User;
import DAO.RoomScheduleDAO;
import DAO.StaffDAO;
import jakarta.servlet.RequestDispatcher;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.List;

public class StaffAttendance extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        StaffDAO staffDAO = new StaffDAO();
        User user = (User) session.getAttribute("user");
        Staff staff = staffDAO.getStaffByUsername(user.getUsername());
        List<Section> sections = staffDAO.getSectionByStaffId(staff.getStaffId());
        request.setAttribute("sections", sections);
        
        RequestDispatcher dispatcher = request.getRequestDispatcher("/staffattendance.jsp");
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
