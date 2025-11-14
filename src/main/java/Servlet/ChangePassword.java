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
import java.net.URLEncoder;
import java.util.HashSet;

@WebServlet(name = "ChangePassWord", urlPatterns = {"/ChangePassWord"})
public class ChangePassword extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        User user = (User) session.getAttribute("user");
        String currentPassword = request.getParameter("currentPassword");
        String newPassword = request.getParameter("newPassword");
        String role = user.getRole();
        UserDAO userDAO = new UserDAO();

        boolean isPasswordChanged = userDAO.changePassword(user.getUsername(), currentPassword, newPassword);

        if (isPasswordChanged) {
            String result = "Password updated successfully!";
            if (role.equals("student")) {
                response.sendRedirect(request.getContextPath() + "/StudentProfile?result=" + URLEncoder.encode(result, "UTF-8"));
            } else {
                response.sendRedirect(request.getContextPath() + "/StaffProfile?result=" + URLEncoder.encode(result, "UTF-8"));
            }
        } else {
            String result = "Password is incorrect!";
            if (role.equals("student")) {
                response.sendRedirect(request.getContextPath() + "/StudentProfile?result=" + URLEncoder.encode(result, "UTF-8"));
            } else {
                response.sendRedirect(request.getContextPath() + "/StaffProfile?result=" + URLEncoder.encode(result, "UTF-8"));
            }
        }
    }
}
