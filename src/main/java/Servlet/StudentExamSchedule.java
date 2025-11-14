package Servlet;

import Class.*;
import jakarta.servlet.RequestDispatcher;
import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import DAO.*;
import jakarta.servlet.http.HttpSession;
import java.util.List;

public class StudentExamSchedule extends HttpServlet {

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

        List<Exam> exams = studentDAO.getExamsByStudentId(student.getStudentId());
        request.setAttribute("exams", exams);

        String week = "1";
        String action = "";
        String semester_year = "";
        
        if (request.getParameter("action") != null) {
            action = request.getParameter("action");
        }
        if ("Go".equals(action)) {
            if (request.getParameter("week") != null && !request.getParameter("week").isEmpty()) {
                week = request.getParameter("week");
                request.setAttribute("week", week);
            } 
            if (request.getParameter("semester year") != null) {
                semester_year = request.getParameter("semester year");
                String[] splited = semester_year.split("\\s+");
                request.setAttribute("se", splited[0]);
                request.setAttribute("ye", splited[1]);
            }
        }
        
        RequestDispatcher dispatcher = request.getRequestDispatcher("studentexamschedule.jsp");
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
