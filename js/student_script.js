import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const appSetting = { 
    databaseURL: "https://student-teacher-project-e28b9-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSetting);
const database = getDatabase(app);
const UserListInDB = ref(database, "std_users");

const stu_username = document.querySelector("#stu_username");
const stu_password = document.querySelector("#stu_password");
const stu_frm = document.querySelector("#frm");

stu_frm.addEventListener("submit", function (e) {
    e.preventDefault();

    const enteredUsername = stu_username.value.trim();
    const enteredPassword = stu_password.value.trim();

    if (!enteredUsername || !enteredPassword) {
        alert("Please enter both username and password.");
        return;
    }

    onValue(UserListInDB, function (snapshot) {
        if (snapshot.exists()) {
            const users = snapshot.val();
            let loginSuccess = false;
            let studentDetails = null;

            Object.values(users).forEach(user => {
                if (user.stu_username === enteredUsername && user.stu_password === enteredPassword) {
                    loginSuccess = true;
                    studentDetails = user; 
                }
            });

            if (loginSuccess) {
                alert("Login Successful");

                sessionStorage.setItem("studentDetails", JSON.stringify(studentDetails));

                window.location.href = "student_dashboard.html";
            } else {
                alert("Invalid username or password.");
            }
        } else {
            alert("No users found in the database.");
        }
    });
});
