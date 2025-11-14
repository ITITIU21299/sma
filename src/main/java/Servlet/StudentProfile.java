package Servlet;

import Class.Student;
import Class.User;
import DAO.StudentDAO;
import jakarta.servlet.RequestDispatcher;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet(name = "StudentProfile", urlPatterns = {"/StudentProfile"})
public class StudentProfile extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        User user = (User) session.getAttribute("user");
        StudentDAO studentDAO = new StudentDAO();
        Student student = studentDAO.getStudentByUsername(user.getUsername());
        request.setAttribute("student", student);

        String username = user.getUsername();
        request.setAttribute("username", username);
        
        String result = request.getParameter("result");
        if (result != null) {
            request.setAttribute("result", result);
        }

        RequestDispatcher dispatcher = request.getRequestDispatcher("/studentprofile.jsp");
        dispatcher.forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String username = request.getParameter("username");
        String fullName = request.getParameter("fullName");
        String dateOfBirth = request.getParameter("dateOfBirth");
        String email = request.getParameter("email");
        StudentDAO studentDAO = new StudentDAO();
        
        if (fullName != null && !fullName.trim().isEmpty()) {
            studentDAO.updateStudentNameByUsername(username, fullName.trim());
        }

        if (email != null && !email.trim().isEmpty()) {
            studentDAO.updateStudentEmailByUsername(username, email.trim());
        }

        if (dateOfBirth != null && !dateOfBirth.trim().isEmpty()) {
            studentDAO.updateStudentDOBByUsername(username, dateOfBirth.trim());
        }

        response.sendRedirect(request.getContextPath() + "/StudentProfile");
    }
}

