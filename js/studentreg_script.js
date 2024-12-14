import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase,ref,push,onValue,remove,set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const appSetting = { 
    databaseURL: "https://student-teacher-project-e28b9-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSetting);
const database = getDatabase(app);
const studentsRef = ref(database, "students_reg");

const stud_frm = document.querySelector("#stud_frm");
const username = document.querySelector("#username");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const department = document.querySelector("#department");

stud_frm.addEventListener("submit", function (e) {
    e.preventDefault();

    const studentData = {
        stu_username: username.value.trim(),
        stu_email: email.value.trim(),
        stu_password: password.value.trim(),
        stu_department: department.value
    };

    push(studentsRef, studentData)
        .then(() => {
            alert("Registration Successful!");
            stud_frm.reset();
            window.location.href = "student_dashboard.html";
        })
        .catch((error) => {
            console.error("Error adding student:", error);
            alert("An error occurred. Please try again.");
        });
});