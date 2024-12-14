import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const appSetting = {
    databaseURL: "https://student-teacher-project-e28b9-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSetting);
const database = getDatabase(app);
const UserListInDB = ref(database, "tea_users");

const tea_username = document.querySelector("#tea_username");
const tea_password = document.querySelector("#tea_password");
const tea_frm = document.querySelector("#frm");

tea_frm.addEventListener("submit", function (e) {
    e.preventDefault();

    const enteredUsername = tea_username.value.trim();
    const enteredPassword = tea_password.value.trim();

    if (!enteredUsername || !enteredPassword) {
        alert("Please enter both username and password.");
        return;
    }

    onValue(UserListInDB, function (snapshot) {
        if (snapshot.exists()) {
            let loginSuccess = false;
            let teacherDetails = null;
            let teacherKey = null;

            snapshot.forEach((childSnapshot) => {
                const teacher = childSnapshot.val();
                if (teacher.tea_name === enteredUsername && teacher.tea_password === enteredPassword) {
                    loginSuccess = true;
                    teacherDetails = teacher;
                    teacherKey = childSnapshot.key;
                }
            });

            if (loginSuccess) {
                alert("Login Successful");
                sessionStorage.setItem(
                    "teacherDetails",
                    JSON.stringify({ key: teacherKey, ...teacherDetails })
                );
                window.location.href = "teacher_dashboard.html";
            } else {
                alert("Invalid username or password.");
            }
        } else {
            alert("No users found in the database.");
        }
    });
});
