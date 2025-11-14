<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="Class.*" %>
<%@page import="DAO.*" %>
<%@page import="java.util.*" %>
<%@page import="java.time.LocalDate" %>
<%@page import="java.time.DayOfWeek" %>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>School Management System - Student Room Schedule</title>
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
                            <a class="nav-link active" aria-current="page" href="${pageContext.request.contextPath}/StudentSchedule"><i class="bi bi-calendar3"></i> Room Schedule</a>
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
            <h1>Room Schedule</h1>
            <div class="card mt-4">
                <div class="card-body">
                    <h5 class="card-title">Your Class Schedule</h5>
                    <form method="post" action="StudentSchedule">
                        <%
                            String week = (String) request.getAttribute("week");
                            String se = (String) request.getAttribute("se");
                            String ye = (String) request.getAttribute("ye");
                            String[] years = (String[]) new String[2];

                            LocalDate currentDate = (LocalDate) LocalDate.now();
                            int iyear = (int) currentDate.getYear();
                            int imonth = (int) currentDate.getMonthValue(); // 1 = January, 12 = December
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
                        <input style="width: 10%" class="form-control d-inline" type="text" name="week" size="20" placeholder="week">                              
                        <select style="width: 15%" class="form-select d-inline" name="semester year"> 
                            <option value="<%=prevSe%> <%=prevYe%>"><%=prevSe%> - <%=prevYe%></option>
                            <option selected="selected" value="<%=semester%> <%=year%>"><%=semester%> - <%=year%></option>
                            <option value="<%=nextSe%> <%=nextYe%>"><%=nextSe%> - <%=nextYe%></option>                                    
                        </select>

                        <input type="submit" name="action" value="Go" class="btn btn-primary">   
                        <input type="hidden" name="current week" value="<%=week%>">
                        <input type="hidden" name="current se" value="<%=se%>">
                        <input type="hidden" name="current ye" value="<%=ye%>">

                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <input type="submit" name="action" value="Previous week" id="prevWeek" class="btn btn-primary"><!--<i class="bi bi-chevron-left"></i>-->
                            <h6 id="currentWeek" class="mb-0">Week <%=week%>: 
                                <%
                                    LocalDate start_date = (LocalDate) LocalDate.of(2020, 1, 1);
                                    if (se.equals("2")) {
                                        start_date = LocalDate.of(Integer.parseInt(years[Integer.parseInt(se) - 1]), 2, 1);
                                    } else {
                                        start_date = LocalDate.of(Integer.parseInt(years[Integer.parseInt(se) - 1]), 8, 1);
                                    }
                                    LocalDate firstMonday = start_date.with(java.time.temporal.TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
                                    out.print(firstMonday.plusWeeks(Integer.parseInt(week)));

                                %></h6>
                            <input type="submit" name="action" value="Next week" id="nextWeek" class="btn btn-primary"><!--<i class="bi bi-chevron-right"></i>-->
                        </div>
                    </form>                       
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>Monday</th>
                                <th>Tuesday</th>
                                <th>Wednesday</th>
                                <th>Thursday</th>
                                <th>Friday</th>
                                <th>Saturday</th>
                                <th>Sunday</th>
                            </tr>
                        </thead>
                        <tbody>
                            <%                                List<Schedule> schedules = (List<Schedule>) request.getAttribute("schedules");
                                List<Schedule> mon = (List<Schedule>) new ArrayList<Schedule>();
                                List<Schedule> tue = (List<Schedule>) new ArrayList<Schedule>();
                                List<Schedule> wed = (List<Schedule>) new ArrayList<Schedule>();
                                List<Schedule> thu = (List<Schedule>) new ArrayList<Schedule>();
                                List<Schedule> fri = (List<Schedule>) new ArrayList<Schedule>();
                                List<Schedule> sat = (List<Schedule>) new ArrayList<Schedule>();
                                List<Schedule> sun = (List<Schedule>) new ArrayList<Schedule>();
                                int cnt = (int) 0;

                                for (Schedule sc : schedules) {
                                    if (!sc.getSemester().equals(se)) {
                                        continue;
                                    }
                                    if (!sc.getWeek().equals(week)) {
                                        continue;
                                    }
                                    String day = sc.getSchedule_date();
                                    switch (day) {
                                        case "2":
                                            mon.add(sc);
                                            break;
                                        case "3":
                                            tue.add(sc);
                                            break;
                                        case "4":
                                            wed.add(sc);
                                            break;
                                        case "5":
                                            thu.add(sc);
                                            break;
                                        case "6":
                                            fri.add(sc);
                                            break;
                                        case "7":
                                            sat.add(sc);
                                            break;
                                        case "1":
                                            sun.add(sc);
                                            break;
                                    }
                                }
                                cnt = Math.max(cnt, mon.size());
                                cnt = Math.max(cnt, tue.size());
                                cnt = Math.max(cnt, wed.size());
                                cnt = Math.max(cnt, thu.size());
                                cnt = Math.max(cnt, fri.size());
                                cnt = Math.max(cnt, sat.size());
                                cnt = Math.max(cnt, sun.size());
                                for (int i = (int) 0; i < cnt; i++) {
                                    out.println("<tr>");
                                    if (mon.size() > i) 
                                    out.println("<td><div style = 'padding-left: 10px' class = 'card'> " + "<span style='color: #4A90E2; font-weight: bold;'>" + mon.get(i).getSubject_name() + " </span> " + "<span>Group " + mon.get(i).getSection_group() +"</span>" + "<span>Room " + mon.get(i).getRoom_id() + "</span>" + "<span style='color: #D0021B;'>" + mon.get(i).getStart_time() + " - " + mon.get(i).getEnd_time() + "</span></div></td>");
                                    else out.println("<td></td>");
                                    if (tue.size() > i)                                    
                                    out.println("<td><div style = 'padding-left: 10px' class = 'card'> " + "<span style='color: #4A90E2; font-weight: bold;'>" + tue.get(i).getSubject_name() + " </span> " + "<span>Group " + tue.get(i).getSection_group() +"</span>" + "<span>Room " + tue.get(i).getRoom_id() + "</span>" + "<span style='color: #D0021B;'>" + tue.get(i).getStart_time() + " - " + tue.get(i).getEnd_time() + "</span></div></td>");
                                    else out.println("<td></td>");
                                    if (wed.size() > i)                                    
                                    out.println("<td><div style = 'padding-left: 10px' class = 'card'> " + "<span style='color: #4A90E2; font-weight: bold;'>" + wed.get(i).getSubject_name() + " </span> " + "<span>Group " + wed.get(i).getSection_group() +"</span>" + "<span>Room " + wed.get(i).getRoom_id() + "</span>" + "<span style='color: #D0021B;'>" + wed.get(i).getStart_time() + " - " + wed.get(i).getEnd_time() + "</span></div></td>");
                                    else out.println("<td></td>");
                                    if (thu.size() > i)                                    
                                    out.println("<td><div style = 'padding-left: 10px' class = 'card'> " + "<span style='color: #4A90E2; font-weight: bold;'>" + thu.get(i).getSubject_name() + " </span> " + "<span>Group " + thu.get(i).getSection_group() +"</span>" + "<span>Room " + thu.get(i).getRoom_id() + "</span>" + "<span style='color: #D0021B;'>" + thu.get(i).getStart_time() + " - " + thu.get(i).getEnd_time() + "</span></div></td>");
                                    else out.println("<td></td>");                                    
                                    if (fri.size() > i)                                    
                                    out.println("<td><div style = 'padding-left: 10px' class = 'card'> " + "<span style='color: #4A90E2; font-weight: bold;'>" + fri.get(i).getSubject_name() + " </span> " + "<span>Group " + fri.get(i).getSection_group() +"</span>" + "<span>Room " + fri.get(i).getRoom_id() + "</span>" + "<span style='color: #D0021B;'>" + fri.get(i).getStart_time() + " - " + fri.get(i).getEnd_time() + "</span></div></td>");
                                    else out.println("<td></td>");                                    
                                    if (sat.size() > i)                                    
                                    out.println("<td><div style = 'padding-left: 10px' class = 'card'> " + "<span style='color: #4A90E2; font-weight: bold;'>" + sat.get(i).getSubject_name() + " </span> " + "<span>Group " + sat.get(i).getSection_group() +"</span>" + "<span>Room " + sat.get(i).getRoom_id() + "</span>" + "<span style='color: #D0021B;'>" + sat.get(i).getStart_time() + " - " + sat.get(i).getEnd_time() + "</span></div></td>");
                                    else out.println("<td></td>");
                                    if (sun.size() > i)                                    
                                    out.println("<td><div style = 'padding-left: 10px' class = 'card'> " + "<span style='color: #4A90E2; font-weight: bold;'>" + sun.get(i).getSubject_name() + " </span> " + "<span>Group " + sun.get(i).getSection_group() +"</span>" + "<span>Room " + sun.get(i).getRoom_id() + "</span>" + "<span style='color: #D0021B;'>" + sun.get(i).getStart_time() + " - " + sun.get(i).getEnd_time() + "</span></div></td>");
                                    else out.println("<td></td>");

                                    out.println("</tr>");
                                }
                            %>

                            </tr>
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
        <script src="JavaScript/theme.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>

</html>


