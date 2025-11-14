package Servlet;

import Class.Attendance;
import Class.Student;
import Class.User;
import DAO.AttendanceDAO;
import DAO.StudentDAO;
import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet(name = "StudentAttendance", urlPatterns = {"/StudentAttendance"})
public class StudentAttendance extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException, SQLException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            response.sendRedirect(request.getContextPath() + "/index.jsp");
            return;
        }
        StudentDAO studentDAO = new StudentDAO();
        User user = (User) session.getAttribute("user");
        Student student = studentDAO.getStudentByUsername(user.getUsername());

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

        request.setAttribute("student", student);
        request.setAttribute("attendanceMap", attendanceMap);
        request.setAttribute("presentDays", presentDays);
        request.setAttribute("absentDays", absentDays);
        request.setAttribute("attendanceRate", attendanceRate);
        
        request.getRequestDispatcher("studentattendance.jsp").forward(request, response);
        
    }
    

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            processRequest(request, response);
        } catch (SQLException ex) {
            Logger.getLogger(StudentAttendance.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            processRequest(request, response);
        } catch (SQLException ex) {
            Logger.getLogger(StudentAttendance.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}
