/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */


document.addEventListener("DOMContentLoaded", function () {
    const darkModeToggle = document.getElementById("darkMode");
    const body = document.body;

    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("bg-dark");
        body.classList.add("text-white");
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener("change", function () {
        if (darkModeToggle.checked) {
            body.classList.add("bg-dark");
            body.classList.add("text-white");
            localStorage.setItem("darkMode", "enabled");
        } else {
            body.classList.remove("bg-dark");
            body.classList.remove("text-white");
            localStorage.removeItem("darkMode");
        }
    });
});
