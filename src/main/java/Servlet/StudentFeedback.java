package Servlet;

import Class.*;
import DAO.*;
import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.RequestDispatcher;
import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.Properties;

public class StudentFeedback extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        User user = (User) session.getAttribute("user");
        StudentDAO studentDAO = new StudentDAO();
        Student student = studentDAO.getStudentByUsername(user.getUsername());
        String studentId = student.getStudentId();
        request.setAttribute("studentId", studentId);

        RequestDispatcher dispatcher = request.getRequestDispatcher("studentfeedback.jsp");
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
        String studentId = request.getParameter("studentId");
        String studentName = request.getParameter("studentName");
        String feedbackType = request.getParameter("feedbackType");
        String feedbackSubject = request.getParameter("feedbackSubject");
        String feedbackMessage = request.getParameter("feedbackMessage");

        String host = "smtp.gmail.com";
        final String username = "schoolmanagementsender@gmail.com";
        final String password = "mpjaxshonpfyuyii";
        String recipient = "schoolmanagementad@gmail.com";

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });
        String resultMessage;
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(username));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipient));
            message.setSubject("Feedback: " + feedbackSubject);

            StringBuilder content = new StringBuilder();
            content.append("Feedback Type: ").append(feedbackType).append("\n")
                    .append("Student ID: ").append(studentId != null ? studentId : "Anonymous").append("\n")
                    .append("Student Name: ").append(studentName != null ? studentName : "Anonymous").append("\n")
                    .append("Feedback Message:\n")
                    .append(feedbackMessage);

            message.setText(content.toString());

            Transport.send(message);

            resultMessage = "Feedback submitted successfully! Thank you for your feedback.";

        } catch (MessagingException e) {
            e.printStackTrace();
            resultMessage = "Error sending feedback. Please try again later.";
        }
        request.setAttribute("resultMessage", resultMessage);
        request.setAttribute("studetId", studentId);
        RequestDispatcher dispatcher = request.getRequestDispatcher("studentfeedback.jsp");
        dispatcher.forward(request, response);
    }
}
