<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="Class.*" %>
<%@page import="DAO.*" %>
<%@page import="java.sql.*" %>
<%@page import="java.util.*" %>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>School Management System - Dashboard</title>
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
                            <a class="nav-link" aria-current="page" href="${pageContext.request.contextPath}/StaffPages"><i class="bi bi-house-door"></i> Dashboard</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="staffDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-people"></i> Staff
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="staffDropdown">
                                <li><a class="dropdown-item" href="${pageContext.request.contextPath}/StaffSalary"><i class="bi bi-cash"></i> Salary Information</a></li>
                                <li><a class="dropdown-item" href="${pageContext.request.contextPath}/StaffSchedule"><i class="bi bi-calendar3"></i> Schedule</a></li>
                            </ul>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle active" href="#" id="sectionDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-mortarboard"></i> Class
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="studentDropdown">
                                <li><a class="dropdown-item" href="${pageContext.request.contextPath}/StaffAttendance"><i class="bi bi-calendar2-check-fill"></i> Manage Attendance</a></li>
                                <li><a class="dropdown-item" href="${pageContext.request.contextPath}/StaffAssignRoom"><i class="bi bi-card-checklist"></i> Assign Room</a></li>
                            </ul>
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
                                            <a class="dropdown-item" href="${pageContext.request.contextPath}/StaffProfile">Profile</a>
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
            <div class="card mt-4"> 
                <div class="card-body">
                    <h5 class="card-title">Staff Section Management</h5>

                    <a class="btn btn-danger mt-2 mb-2" href="${pageContext.request.contextPath}/StaffAssignRoom">Manage Section - Click to switch</a>

                    <button type="button" class="btn btn-danger mt-2 mb-2" onclick="confirmDropAll()">Drop All</button>

                    <form id="dropAllForm" action="StaffDropAllRooms" method="post" style="display: none;">
                        <% 
                            List<AssignedRoom> dropRooms = (List<AssignedRoom>) request.getAttribute("assignedRooms");
                            if (dropRooms != null) {
                                for (AssignedRoom aroom : dropRooms) { 
                        %>
                        <input type="hidden" name="scheduleIds" value="<%= aroom.getScheduleId() %>">
                        <% 
                                } 
                            } 
                        %>
                    </form>
                    <table class="table table-striped" id="assignedRooms">
                        <thead>
                            <tr>
                                <th style="width: 10%">Room</th>
                                <th>Type</th>
                                <th>Capacity</th>
                                <th>Weekday</th>
                                <th>Week No.</th>
                                <th>Time</th>
                                <th>Section</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <% 
                            List<AssignedRoom> assignedRooms = (List<AssignedRoom>) request.getAttribute("assignedRooms");
                            for (AssignedRoom aroom : assignedRooms) {
                            %>
                            <tr>
                                <td><%= aroom.getNumber() %></td>

                                <td><%= aroom.getType() %></td>

                                <td><%= aroom.getCapacity() %></td>

                                <% 
                                    String dateStr = aroom.getDate(); 
                                    String dayOfWeek = "Invalid Day";

                                    if (dateStr != null && !dateStr.isEmpty()) {
                                        switch (dateStr) {
                                            case "2":
                                                dayOfWeek = "Monday";
                                                break;
                                            case "3":
                                                dayOfWeek = "Tuesday";
                                                break;
                                            case "4":
                                                dayOfWeek = "Wednesday";
                                                break;
                                            case "5":
                                                dayOfWeek = "Thursday";
                                                break;
                                            case "6":
                                                dayOfWeek = "Friday";
                                                break;
                                            case "7":
                                                dayOfWeek = "Saturday";
                                                break;
                                            case "8":
                                                dayOfWeek = "Sunday";
                                                break;
                                            default:
                                                dayOfWeek = "Invalid Day";
                                                break;
                                        }
                                    }
                                %>

                                <td><%= dayOfWeek %></td>

                                <td><%= aroom.getWeek() %></td>

                                <td><%= aroom.getStartTime() %> - <%= aroom.getEndTime() %></td>

                                <td><%= aroom.getSubjectName() %> - Group <%= aroom.getGroup() %></td>

                                <td>
                                    <form action="StaffDropRoom" method="post">
                                        <input type="hidden" name="scheduleId" value="<%= aroom.getScheduleId() %>">
                                        <input type="hidden" name="date" value="<%= aroom.getDate() %>">
                                        <input type="hidden" name="week" value="<%= aroom.getWeek() %>">
                                        <input type="hidden" name="start" value="<%= aroom.getStartTime() %>">
                                        <input type="hidden" name="end" value="<%= aroom.getEndTime() %>">                                        
                                        <input type="submit" value="Drop">
                                    </form>
                                </td>
                            </tr>
                            <% } %>
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
        <script>
                        function confirmDropAll() {
                            if (confirm("Are you sure you want to drop all assigned rooms for your schedule? This action cannot be undone.")) {
                                document.getElementById('dropAllForm').submit();
                            }
                        }
        </script>
    </body>
</html>