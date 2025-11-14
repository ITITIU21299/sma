package Servlet;

import Class.*;
import jakarta.servlet.RequestDispatcher;
import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import DAO.*;
import jakarta.servlet.http.HttpSession;
import java.util.*;

@WebServlet(name = "StudentPages", urlPatterns = {"/StudentPages"})
public class StudentPages extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect(request.getContextPath() + "/index.jsp");
            return;
        }

        User user = (User) session.getAttribute("user");

        StudentDAO studentDAO = new StudentDAO();
        Student student = studentDAO.getStudentByUsername(user.getUsername());
        request.setAttribute("student", student);

        float marks = studentDAO.getMarksByStudentId(student.getStudentId());
        request.setAttribute("marks", marks);

        AttendanceDAO attendanceDAO = new AttendanceDAO();
        Map<String, List<Attendance>> attendanceMap = attendanceDAO.getAttendanceByStudentId(student.getStudentId());

        int totalSessions = 0;
        double presentDays = 0;
        int absentDays = 0;

        for (Map.Entry<String, List<Attendance>> entry : attendanceMap.entrySet()) {
            for (Attendance record : entry.getValue()) {
                totalSessions++;
                if ("present".equals(record.getStatus())) {
                    presentDays++;
                } else if ("absent".equals(record.getStatus())) {
                    absentDays++;
                } else if ("late".equals(record.getStatus())) {
                    presentDays += 0.5;
                }
            }
        }

        double attendanceRate = (totalSessions > 0) ? (presentDays * 100.0 / totalSessions) : 0;
        request.setAttribute("attendanceRate", attendanceRate);

        RequestDispatcher dispatcher = request.getRequestDispatcher("studentpages.jsp");
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
