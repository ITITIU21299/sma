/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package Servlet;

import Util.DBUtil;
import jakarta.servlet.RequestDispatcher;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author huynh
 */
public class UpdateAttendance extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String assignmentId = request.getParameter("assignmentId");
        String[] statusSelections = request.getParameterValues("status");
         System.out.println(assignmentId);

        if (statusSelections != null) {
            try (Connection conn = DBUtil.getConnection()) {
                String queryCheck = "SELECT attendance_id FROM Attendance WHERE student_id = ? AND assignment_id = ?";
                String queryUpdate = "UPDATE Attendance SET status = ? WHERE attendance_id = ?";
                String queryInsert = "INSERT INTO Attendance (attendance_id, student_id, assignment_id, status) VALUES (?, ?, ?, ?)";

                PreparedStatement psCheck = conn.prepareStatement(queryCheck);
                PreparedStatement psUpdate = conn.prepareStatement(queryUpdate);
                PreparedStatement psInsert = conn.prepareStatement(queryInsert);

                for (String selection : statusSelections) {
                    String[] parts = selection.split("_");
                    String studentId = parts[0];
                    String status = parts[1];

                    System.out.println(studentId);
                    System.out.println(status);

                    psCheck.setString(1, studentId);
                    psCheck.setString(2, assignmentId);
                    ResultSet rs = psCheck.executeQuery();

                    if (rs.next()) {

                        String attendanceId = studentId + "_" + assignmentId;
                        psUpdate.setString(1, status);
                        psUpdate.setString(2, attendanceId);
                        psUpdate.executeUpdate();
                        
                    } else {
                        System.out.println("222222222");
                        String attendanceId = studentId + "_" + assignmentId;
                        psInsert.setString(1, attendanceId);
                        psInsert.setString(2, studentId);
                        psInsert.setString(3, assignmentId);
                        psInsert.setString(4, status);
                        psInsert.executeUpdate();
                    }
                }

                response.sendRedirect(request.getContextPath() + "/StaffAttendance");

            } catch (SQLException e) {
                e.printStackTrace();
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error");
            }
        }
    }
}
