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
        <style>
            .modal-header {
                background-color: #007bff;
                color: white;
            }

            .modal-body {
                background-color: #f8f9fa;
                color: black;
            }

            .modal-footer {
                background-color: #f8f9fa;
            }

            .modal-title {
                color: white;
            }

            .btn-close {
                color: white;
            }
        </style>
    </head>
    <body style="display: flex; min-height: 100vh; flex-direction: column">

        <div class="modal fade" id="resultsModal" tabindex="-1" aria-labelledby="resultsModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="resultsModalLabel">Assignment Results</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <ul>
                            <%
                                Map<String, String> assignmentResults = (Map<String, String>) request.getAttribute("assignmentResults");
                                if (assignmentResults != null && !assignmentResults.isEmpty()) {
                                    for (Map.Entry<String, String> entry : assignmentResults.entrySet()) {
                                    if ("Success".equals(entry.getKey())) {
                            %>
                            <li style="color: green;"><strong><%= entry.getKey() %>:</strong> <%= entry.getValue() %></li>
                                <%
                                    }
                            }
                                 for (Map.Entry<String, String> entry : assignmentResults.entrySet()) {
                                if (!"Success".equals(entry.getKey())) {
                                %>
                            <li style="color: red;"><strong><%= entry.getKey() %>:</strong> <%= entry.getValue() %></li>
                                <%
                                        }
                                    }
                                }
                                %>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>

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
                    <h5 class="card-title">Staff Section Assignment</h5>

                    <a href="${pageContext.request.contextPath}/StaffDropRoom" class="btn btn-primary mt-2 mb-2">Assign Section - Click to switch</a>

                    <table class="table table-striped" id="availableRooms" style="table-layout: fixed;">
                        <thead>
                            <tr>
                                <th style="width: 10%;">Room</th>
                                <th style="width: 10%;">Type</th>
                                <th style="width: 10%;">Capacity</th>
                                <th style="width: 15%;">Time</th>
                                <th style="width: 55%;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <% 
                            List<Room> rooms = (List<Room>) request.getAttribute("rooms");
                            for (Room room : rooms) {
                            %>
                            <tr>
                                <td><%= room.getNumber() %></td>

                                <td><%= room.getType() %></td>

                                <td><%= room.getCapacity() %></td>

                                <td><%= room.getStartTime() %> - <%= room.getEndTime() %></td>

                                <td>
                                    <form action="StaffAssignRoom" method="post">
                                        <input type="hidden" name="roomScheduleId" value="<%= room.getScheduleId() %>">

                                        <div class="row">

                                            <div class="col-12 col-lg-3">
                                                <div class="d-inline-block">
                                                    <select class="form-select" name="sectionId">
                                                        <option selected>Choose section to assign</option>
                                                        <% 
                                                        List<Section> sections = (List<Section>) request.getAttribute("sections");
                                                        for (Section section : sections) {
                                                        %>
                                                        <option value="<%= section.getId() %>"><%= section.getName() %> - Group <%= section.getGroup() %></option>
                                                        <% } %>
                                                    </select>
                                                </div>
                                            </div>

                                            <div class="col-12 col-lg-4">
                                                <div class="d-inline-block" style="margin-left: 20px;">
                                                    <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#weekdaysCollapse_<%= room.getScheduleId() %>" aria-expanded="false" aria-controls="weekdaysCollapse_<%= room.getScheduleId() %>">
                                                        Select Weekdays
                                                    </button>
                                                    <div class="collapse" id="weekdaysCollapse_<%= room.getScheduleId() %>" style="min-width: 250px; position: relative; right: 50px">
                                                        <div class="card card-body p-3">
                                                            <div class="row row-cols-2 g-1">
                                                                <div class="col d-flex justify-content-center align-items-center">
                                                                    <input class="btn-check" id="btn-check-monday_<%= room.getScheduleId() %>" autocomplete="off" type="checkbox" name="weekdays" value="2">
                                                                    <label class="btn btn-outline-primary w-70" for="btn-check-monday_<%= room.getScheduleId() %>">Monday</label>
                                                                </div>
                                                                <div class="col d-flex justify-content-center align-items-center">
                                                                    <input class="btn-check" id="btn-check-tuesday_<%= room.getScheduleId() %>" autocomplete="off" type="checkbox" name="weekdays" value="3">
                                                                    <label class="btn btn-outline-primary w-70" for="btn-check-tuesday_<%= room.getScheduleId() %>">Tuesday</label>
                                                                </div>
                                                                <div class="col d-flex justify-content-center align-items-center">
                                                                    <input class="btn-check" id="btn-check-wednesday_<%= room.getScheduleId() %>" autocomplete="off" type="checkbox" name="weekdays" value="4">
                                                                    <label class="btn btn-outline-primary w-70" for="btn-check-wednesday_<%= room.getScheduleId() %>">Wednesday</label>
                                                                </div>
                                                                <div class="col d-flex justify-content-center align-items-center">
                                                                    <input class="btn-check" id="btn-check-thursday_<%= room.getScheduleId() %>" autocomplete="off" type="checkbox" name="weekdays" value="5">
                                                                    <label class="btn btn-outline-primary w-70" for="btn-check-thursday_<%= room.getScheduleId() %>">Thursday</label>
                                                                </div>
                                                                <div class="col d-flex justify-content-center align-items-center">
                                                                    <input class="btn-check" id="btn-check-friday_<%= room.getScheduleId() %>" autocomplete="off" type="checkbox" name="weekdays" value="6">
                                                                    <label class="btn btn-outline-primary w-70" for="btn-check-friday_<%= room.getScheduleId() %>">Friday</label>
                                                                </div>
                                                                <div class="col d-flex justify-content-center align-items-center">
                                                                    <input class="btn-check" id="btn-check-saturday_<%= room.getScheduleId() %>" autocomplete="off" type="checkbox" name="weekdays" value="7">
                                                                    <label class="btn btn-outline-primary w-70" for="btn-check-saturday_<%= room.getScheduleId() %>">Saturday</label>
                                                                </div>
                                                                <div class="col d-flex justify-content-center align-items-center">
                                                                    <input class="btn-check" id="btn-check-sunday_<%= room.getScheduleId() %>" autocomplete="off" type="checkbox" name="weekdays" value="8">
                                                                    <label class="btn btn-outline-primary w-70" for="btn-check-sunday_<%= room.getScheduleId() %>">Sunday</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="col-12 col-lg-3">
                                                <div class="d-inline-block">
                                                    <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#weeksCollapse_<%= room.getScheduleId() %>" aria-expanded="false" aria-controls="weeksCollapse_<%= room.getScheduleId() %>">
                                                        Choose Week
                                                    </button>
                                                    <div class="collapse" id="weeksCollapse_<%= room.getScheduleId() %>" style="min-width: 200px">
                                                        <div class="card card-body p-3">
                                                            <div class="row g-1">
                                                                <% for (int i = 1; i <= 15; i++) { %>
                                                                <div class="col d-flex justify-content-center align-items-center">
                                                                    <input class="btn-check" id="btn-check-<%= i %>_<%= room.getScheduleId() %>" autocomplete="off" type="checkbox" name="weeks" value="<%= i %>">
                                                                    <label class="btn btn-outline-primary w-70" for="btn-check-<%= i %>_<%= room.getScheduleId() %>"><%= i %></label>
                                                                </div>
                                                                <% } %>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ul class="dropdown-menu" id="dropdownWeeks_<%= room.getScheduleId() %>"  aria-labelledby="dropdownWeeks_<%= room.getScheduleId() %>">
                                                        <% for (int i = 1; i <= 15; i++) { %>
                                                        <li style="text-align: center;"><input class="btn-check" id="btn-check-<%= i %>_<%= room.getScheduleId() %>" autocomplete="off" type="checkbox" name="weeks" value="<%= i %>"><label style="margin: 5px auto;" class="btn btn-outline-secondary" for="btn-check-<%= i %>_<%= room.getScheduleId() %>"><%= i %></label></li>
                                                            <% } %>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div class="col-12 col-lg-2">
                                                <div class="d-inline-block">
                                                    <input type="submit" class="btn btn-outline-success" value="Assign">
                                                </div>
                                            </div>
                                        </div>
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
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
        <script src="JavaScript/theme.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script>
            <% 
                if (assignmentResults != null && !assignmentResults.isEmpty()) { 
            %>
            document.addEventListener('DOMContentLoaded', function () {
                var resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'));
                resultsModal.show();
            });
            <% 
                } 
            %>
        </script>
    </body>
</html>