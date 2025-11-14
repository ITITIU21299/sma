<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>School Management System - Login</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
        <link href="styles.css" rel="stylesheet">
    </head>
    <body>
        <div class="background-container">
            <img src="imgs/login-background.jpg" alt="Background" style="width: 100%; height: 100%; object-fit: cover; position: absolute; z-index: -1;">
            <div class="container">
                <div class="row justify-content-center align-items-center min-vh-100">
                    <div class="col-md-6 col-lg-4">
                        <div class="card shadow">
                            <div class="card-body">
                                <div class="text-center mb-4">
                                    <img src="imgs/logo.png" alt="School Logo" class="mb-3" style="height: 80px; width: 80px;">
                                    <h2 class="card-title">School Management System</h2>
                                </div>
                                <form method="post" action="Login">
                                    <div class="mb-3">
                                        <label for="username" class="form-label">Username</label>
                                        <input type="text" class="form-control" id="username" name="username" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="password" class="form-label">Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="password" name="password" required>
                                            <button class="btn" type="button" id="togglePassword" style="border-left: none;">
                                                <i class="bi bi-eye-slash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="d-grid">
                                        <input type="submit" class="btn btn-primary" value="Login">
                                    </div> 
                                    <% String errorMessage = (String) request.getAttribute("errorMessage"); 
                                         if (errorMessage != null) { %>
                                    <p style="color: red;"><%= errorMessage %></p>
                                    <% } %>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script>
            document.getElementById('togglePassword').addEventListener('click', function () {
                const passwordField = document.getElementById('password');
                const icon = this.querySelector('i');

                if (passwordField.type === 'password') {
                    passwordField.type = 'text';
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                } else {
                    passwordField.type = 'password';
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                }
            });
        </script>
    </body>
</html>