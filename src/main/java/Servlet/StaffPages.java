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
import java.util.*;

@WebServlet(name = "StaffPages", urlPatterns = {"/StaffPages"})
public class StaffPages extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect(request.getContextPath() + "/index.jsp");
            return;
        }
        StaffDAO staffDAO = new StaffDAO();
        User user = (User) session.getAttribute("user");

        Staff staff = staffDAO.getStaffByUsername(user.getUsername());

        int totalStudents = staffDAO.getNumberOfStudentsByStaffId(staff.getStaffId());
        request.setAttribute("totalStudents", totalStudents);
        
        int totalClasses = staffDAO.getNumberOfClassByStaffId(staff.getStaffId());
        request.setAttribute("totalClasses", totalClasses);
        
        String staffName = staff.getName();
        request.setAttribute("staffName", staffName);
        
        
        RequestDispatcher dispatcher = request.getRequestDispatcher("staffpages.jsp");
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
