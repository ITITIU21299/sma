package Servlet;

import Class.*;
import DAO.*;
import java.util.*;
import jakarta.servlet.RequestDispatcher;
import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

public class StudentFee extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        User user = (User) session.getAttribute("user");

        StudentDAO studentDAO = new StudentDAO();
        Student student = studentDAO.getStudentByUsername(user.getUsername());

        List<Fee> fees = studentDAO.getFeesByStudentId(student.getStudentId());
        request.setAttribute("fees", fees);

        RequestDispatcher dispatcher = request.getRequestDispatcher("/studentfee.jsp");
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
