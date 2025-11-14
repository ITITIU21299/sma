<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="Class.*" %>
<%@page import="DAO.*" %>
<%@page import="java.sql.*" %>
<%@page import="java.util.*" %>
<%@page import="java.time.LocalDate" %>
<%@page import="java.time.DayOfWeek" %>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>School Management System - Student Exam Schedule</title>
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
                            <a class="nav-link active" href="${pageContext.request.contextPath}/StudentExamSchedule"><i class="bi bi-calendar-check"></i> Exam Schedule</a>
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
                            <a class="nav-link dropdown-toggle" href="#" id="staffDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
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
            <h1>Exam Schedule for ${student.getName()}</h1>
            <div class="card mt-4">
                <div class="card-body">
                    <h5 class="card-title">Upcoming Exams</h5>
                    <form method="post" action="StudentExamSchedule">
                        <%
                            String week = (String) request.getAttribute("week");
                            String se = (String) request.getAttribute("se");
                            String ye = (String) request.getAttribute("ye");
                            String[] years = (String[]) new String[2];

                            LocalDate currentDate = (LocalDate) LocalDate.now();
                            int iyear = (int) currentDate.getYear();
                            int imonth = (int) currentDate.getMonthValue();
                            int isemester = (int) imonth / 7;
                            if (isemester == 0) {
                                isemester = 2;
                            } else {
                                isemester = 1;
                            }
                            String prevSe = (String) "";
                            String prevYe = (String) "";
                            String nextSe = (String) "";
                            String nextYe = (String) "";
                            String year = (String) "";
                            String month = (String) "";
                            String semester = (String) "";

                            if (isemester == 1) {
                                semester = "1";
                                year = String.valueOf(iyear) + "-" + String.valueOf(iyear + 1);
                                prevSe = "2";
                                prevYe = String.valueOf(iyear - 1) + "-" + String.valueOf(iyear);
                                nextSe = "2";
                                nextYe = String.valueOf(iyear) + "-" + String.valueOf(iyear + 1);
                            } else {
                                semester = "2";
                                year = String.valueOf(iyear - 1) + "-" + String.valueOf(iyear);
                                prevSe = "1";
                                prevYe = String.valueOf(iyear - 1) + "-" + String.valueOf(iyear);
                                nextSe = "1";
                                nextYe = String.valueOf(iyear) + "-" + String.valueOf(iyear + 1);
                            }

                            if (week == null) {
                                week = "1";
                            }
                            if (se == null) {
                                se = semester;
                            }
                            if (ye == null) {
                                if (se.equals("1")) {
                                    ye = String.valueOf(iyear) + "-" + String.valueOf(iyear + 1);
                                } else {
                                    ye = String.valueOf(iyear) + "-" + String.valueOf(iyear + 1);
                                }
                            }
                            years = ye.split("-");
                        %>
                        <p class="d-inline" style="font-weight: bold; color: #007bff">Go to: </p>
                        <select style="width: 15%" class="form-select d-inline" name="semester year"> 
                            <option value="<%=prevSe%> <%=prevYe%>"><%=prevSe%> - <%=prevYe%></option>
                            <option selected="selected" value="<%=semester%> <%=year%>"><%=semester%> - <%=year%></option>
                            <option value="<%=nextSe%> <%=nextYe%>"><%=nextSe%> - <%=nextYe%></option>                                    
                        </select>

                        <input type="submit" name="action" value="Go" class="btn btn-primary d-inline">   

                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 id="currentWeek" class="mb-0">
                                <%
                                    LocalDate start_date = (LocalDate) LocalDate.of(2020, 1, 1);
                                    if (se.equals("2")) {
                                        start_date = LocalDate.of(Integer.parseInt(years[Integer.parseInt(se) - 1]), 2, 1);
                                    } else {
                                        start_date = LocalDate.of(Integer.parseInt(years[Integer.parseInt(se) - 1]), 8, 1);
                                    }
                                    LocalDate firstMonday = start_date.with(java.time.temporal.TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
                                    LocalDate start_mid = (LocalDate) firstMonday.plusWeeks(7);
                                    LocalDate end_mid = (LocalDate) start_mid.plusDays(5);
                                    LocalDate start_fin = (LocalDate) firstMonday.plusWeeks(14);
                                    LocalDate end_fin = (LocalDate) start_fin.plusDays(5);
                                %> 
                            </h6>
                        </div>
                    </form>       
                    <p style="font-weight: bold; color: tomato">Midterm</p>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Room</th>
                            </tr>
                        </thead>
                        <tbody>                        
                            <%
                                List<Exam> exams = (List<Exam>) request.getAttribute("exams");
                                if (exams != null) {
                                    for (Exam exam : exams) {
                                    if (exam.getWeek().equals("8") && exam.getSemester().equals(se) && exam.getSubject_year().equals(ye)) {
                                
                            %>
                            <tr>
                                <td><%= exam.getSubject() != null ? exam.getSubject() : "N/A"%></td>
                                <td><%= start_mid.plusDays(Integer.parseInt(exam.getDate())-2)%></td>
                                <td><%= exam.getStartTime() != null ? exam.getStartTime() : "N/A"%> - 
                                    <%= exam.getEndTime() != null ? exam.getEndTime() : "N/A"%></td>
                                <td><%= exam.getRoomNumber() != null ? exam.getRoomNumber() : "N/A"%></td>
                            </tr>
                            <%
                                    }
                                    }
                                }
                            %>
                        </tbody>
                    </table>
                    <p style="font-weight: bold; color: tomato">Final</p>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Room</th>
                            </tr>
                        </thead>            
                        <tbody>                                                
                            <%
                            if (exams != null) {
                                for (Exam exam : exams) {
                                if (exam.getWeek().equals("15") && exam.getSemester().equals(se) && exam.getSubject_year().equals(ye)) {
                            %>
                            <tr>
                                <td><%= exam.getSubject() != null ? exam.getSubject() : "N/A"%></td>
                                <td><%= start_fin.plusDays(Integer.parseInt(exam.getDate())-2)%></td>
                                <td><%= exam.getStartTime() != null ? exam.getStartTime() : "N/A"%> - 
                                    <%= exam.getEndTime() != null ? exam.getEndTime() : "N/A"%></td>
                                <td><%= exam.getRoomNumber() != null ? exam.getRoomNumber() : "N/A"%></td>
                            </tr>
                            <%
                                    }
                                }
                            }
                            %>
                        </tbody>
                    </table>
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
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script src="main.js"></script>
        <script src="JavaScript/theme.js"></script>
    </body>
</html>

