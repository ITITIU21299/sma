/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
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

/**
 *
 * @author huynh
 */
public class StaffCheckAttendance extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        RequestDispatcher dispatcher = request.getRequestDispatcher("/staffcheckattendance.jsp");
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
        String sectionId = request.getParameter("sectionId");
        String week = request.getParameter("week");
        String date = request.getParameter("date");
        RoomScheduleDAO roomScheduleDAO = new RoomScheduleDAO();

        StudentDAO studentDAO = new StudentDAO();
        try {
            List<Student> students = studentDAO.getStudentsBySectionId(sectionId);
            String assignmentId = roomScheduleDAO.getAssignmentId(date, week, sectionId);
            request.setAttribute("students", students);
            request.setAttribute("week", week);
            request.setAttribute("date", date);
            request.setAttribute("assignmentId", assignmentId);
            if (assignmentId == null) {
                response.sendRedirect(request.getContextPath() + "/StaffAttendance");
                return;
            }

            RequestDispatcher dispatcher = request.getRequestDispatcher("/staffcheckattendance.jsp");
            dispatcher.forward(request, response);
        } catch (SQLException ex) {
            Logger.getLogger(StaffCheckAttendance.class.getName()).log(Level.SEVERE, null, ex);
        }

   
    }

}
