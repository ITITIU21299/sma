package Servlet;

import Class.*;
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
import DAO.*;
import jakarta.servlet.http.HttpSession;
import java.util.List;

public class StaffSalary extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        StaffDAO staffDAO = new StaffDAO();
        HttpSession session = request.getSession(false);
        User user = (User) session.getAttribute("user");
        Staff staff = staffDAO.getStaffByUsername(user.getUsername());
        List<Salary> salaries = staffDAO.getSalaryByStaffId(staff.getStaffId());
        request.setAttribute("salaries", salaries);
        
        RequestDispatcher dispatcher = request.getRequestDispatcher("/staffsalary.jsp");
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
