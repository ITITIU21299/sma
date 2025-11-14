<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="Class.*" %>
<%@page import="DAO.*" %>
<%@page import="java.sql.*" %>
<%@page import="java.util.*" %>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>School Management System - Student Profile</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" rel="stylesheet">
        <link href="styles.css" rel="stylesheet">
    </head>
    <body style="display: flex; min-height: 100vh; flex-direction: column">
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">School Management System</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link" href="${pageContext.request.contextPath}/StudentPages"><i class="bi bi-house-door"></i> Dashboard</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${pageContext.request.contextPath}/StudentFee"><i class="bi bi-cash-coin"></i> Fee Information</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${pageContext.request.contextPath}/StudentExamSchedule"><i class="bi bi-calendar-check"></i> Exam Schedule</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${pageContext.request.contextPath}/StudentSchedule"><i class="bi bi-calendar3"></i> Room Schedule</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${pageContext.request.contextPath}/StudentAttendance"><i class="bi bi-calendar-check"></i> Attendance</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${pageContext.request.contextPath}/StudentFeedback"><i class="bi bi-chat-right-text"></i> Feedback</a>
                        </li>
                    </ul>
                    <ul class="navbar-nav">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle active" href="#" id="staffDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-gear"></i> Setting
                            </a>
                            <ul class="dropdown-menu p-1" aria-labelledby="staffDropdown">
                                <table style="width: 100%; border-spacing: 5px;">
                                    <tr>
                                        <td style="width: 30px; text-align: center;">
                                            <div class="form-check form-switch" style="margin-left: 7px">
                                                <input class="form-check-input" type="checkbox" role="switch" id="darkMode">
                                            </div>
                                        </td>
                                        <td>
                                            <label class="form-check-label" for="darkMode">Dark Mode</label>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="width: 30px; text-align: center;">
                                            <i class="bi bi-person-circle" style="font-size: 1.4rem;"></i>
                                        </td>
                                        <td>
                                            <a class="dropdown-item" href="${pageContext.request.contextPath}/StudentProfile">Profile</a>
                                        </td>
                                    </tr>
                                </table>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${pageContext.request.contextPath}/Logout"><i class="bi bi-box-arrow-right"></i> Logout</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div style="flex: 1" class="container mt-4">
            <h1>Student Profile</h1>
            <div class="row mt-4">
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <img src="imgs/logo.png" alt="School Logo" class="mb-3" style="height: 150px; width: 150px;">
                            <h5 class="card-title">${student.getName()}</h5>
                            <p class="card-text">Student ID: ${student.getStudentId()}</p>
                            <p class="card-text">Email: ${student.getEmail()}</p>
                            <p class="card-text">Date of birth: ${student.getDateOfBirth()}</p>
                            <p class="card-text">Gender: <%
                                Student student = (Student) request.getAttribute("student");
                                String gender = student.getGender();
                                String displayGender;
                                switch (gender) {
                                    case "M":
                                        displayGender = "Male";
                                        break;
                                    case "F":
                                        displayGender = "Female";
                                        break;
                                    default:
                                        displayGender = "Unknown";
                                }
                                %>
                                <%= displayGender%></p>
                            <p class="card-text">Class: ${student.getClassId()}</p>
                            <p class="card-text">Academic year: ${student.getAcademicYear()}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">Personal Information</h5>
                            <form action="StudentProfile" method="POST" onsubmit="return validateForm()">
                                <input type="hidden" name="username" value="${username}">
                                <div class="mb-3">
                                    <label for="fullName" class="form-label">Full Name</label>
                                    <input type="text" class="form-control" id="fullName" name="fullName">
                                </div>
                                <div class="mb-3">
                                    <label for="dateOfBirth" class="form-label">Date of Birth</label>
                                    <input type="text" class="form-control" id="dateOfBirth" name="dateOfBirth">
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" name="email">
                                </div>
                                <button type="submit" class="btn btn-primary">Update Personal Information</button>
                            </form>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Account Settings</h5>
                            <form action="ChangePassword" method="post">
                                <div class="mb-3">
                                    <label for="currentPassword" class="form-label">Current Password</label>
                                    <input type="password" class="form-control" id="currentPassword" name="currentPassword" required>
                                </div>
                                <div class="mb-3">
                                    <label for="newPassword" class="form-label">New Password</label>
                                    <input type="password" class="form-control" id="newPassword" name="newPassword" required>
                                    <small id="newPasswordMessage" class="text-danger" style="display: none;">Password must be at least 7 characters long!</small>
                                </div>
                                <div class="mb-3">
                                    <label for="confirmPassword" class="form-label">Confirm New Password</label>
                                    <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" required>
                                    <small id="confirmPasswordMessage" style="color: red; display: none;">Passwords do not match!</small>
                                </div>
                                <button type="submit" class="btn btn-primary" id="submitBtn">Change Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="footer bg-primary text-white py-2 mt-auto">
            <div class="container">
                <div class="row">
                    <div class="col-md-4 mt-2 mb-2">
                        <h3 class="mb-1 mt-2">School Management System</h3>
                    </div>
                    <div class="col-md-4 mb-2">
                        <h6 class="mb-1 mt-2">Quick Links</h6>
                        <div class="small">
                            <a href="https://github.com/ITITIU21299/SchoolManagement" target="_blank" class="text-white me-2">About</a>
                            <a href="privacy.html" target="_blank" class="text-white me-2">Privacy</a>
                            <a href="terms.html" target="_blank" class="text-white">Terms</a>
                        </div>
                    </div>
                    <div class="col-md-4 mb-2">
                        <h6 class="mb-1">Contact</h6>
                        <p class="small mb-0">schoolmanagementad@gmail.com</p>
                        <p class="small mb-0">0123456789</p>
                    </div>
                </div>
                <hr class="my-2 bg-white opacity-25">
                <div class="text-center small">
                    <p class="mb-0">&copy;2024 School Management System. All rights reserved.</p>
                </div>
            </div>
        </footer>
        <script src="JavaScript/theme.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>


        <div class="modal fade" id="validationErrorModal" tabindex="-1" aria-labelledby="validationErrorModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content" style="color: white;">
                    <div class="modal-header" style="background-color: red">
                        <h5 class="modal-title" id="validationErrorModalLabel">Missing Information</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="font-weight: bold; font-size: 18px; color: red;">
                        Please fill in at least one field.
                    </div>
                    <div class="modal-footer" style="background-color: red">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <script>
                                function validateForm() {
                                    const fullName = document.getElementById("fullName").value.trim();
                                    const dateOfBirth = document.getElementById("dateOfBirth").value.trim();
                                    const email = document.getElementById("email").value.trim();
                                    console.log("AAAAAA");

                                    if (!fullName && !email && !dateOfBirth) {
                                        var myModal = new bootstrap.Modal(document.getElementById('validationErrorModal'));
                                        myModal.show();
                                        return false;
                                    }
                                    return true;
                                }
        </script>

        <script>
            const newPassword = document.getElementById('newPassword');
            const confirmPassword = document.getElementById('confirmPassword');
            const confirmPasswordMessage = document.getElementById('confirmPasswordMessage');
            const newPasswordMessage = document.getElementById('newPasswordMessage');
            const submitBtn = document.getElementById('submitBtn');

            function checkPasswordMatch() {
                const newPasswordValue = newPassword.value;
                const confirmPasswordValue = confirmPassword.value;

                if (newPasswordValue.length < 7) {
                    newPasswordMessage.style.display = 'block';
                    submitBtn.disabled = true;
                } else {
                    newPasswordMessage.style.display = 'none';
                }

                if (newPasswordValue === confirmPasswordValue) {
                    confirmPasswordMessage.style.display = 'none';
                } else {
                    confirmPasswordMessage.style.display = 'block';
                    submitBtn.disabled = true;
                }

                if (newPasswordValue.length >= 7 && newPasswordValue === confirmPasswordValue) {
                    submitBtn.disabled = false;
                }
            }

            newPassword.addEventListener('input', checkPasswordMatch);
            confirmPassword.addEventListener('input', checkPasswordMatch);
        </script>

        <% String result = (String) request.getAttribute("result"); %>
        <% if (result != null) { %>
        <div class="modal fade" id="resultModal" tabindex="-1" aria-labelledby="resultModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <% if (result.contains("successfully")) {%>
                    <div class="modal-header" style="background-color: green">
                        <h5 class="modal-title" id="resultModalLabel" style="font-weight: bold; color: black">Notification</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="color: green">
                        <strong><%= result%></strong>
                    </div>
                    <div class="modal-footer" style="background-color: green">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>
                    <%}%>

                    <% if (result.contains("incorrect")) {%>
                    <div class="modal-header" style="background-color: red">
                        <h5 class="modal-title" id="resultModalLabel" style="font-weight: bold; color: black">Error</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="color: red">
                        <strong><%= result%></strong>
                    </div>
                    <div class="modal-footer" style="background-color: red">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>
                    <%}%>
                </div>
            </div>
        </div>
        <script>
            window.addEventListener('DOMContentLoaded', () => {
                const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
                resultModal.show();
            });
        </script>
        <% }%>
    </body>
</html>

