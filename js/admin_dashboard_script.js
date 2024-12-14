import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set,update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://student-teacher-project-e28b9-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const teacherRef = ref(database, "tea_users");
const studentRegRef = ref(database, "students_reg");

const addTeacherForm = document.getElementById("add_teacher_form");
const teacherList = document.getElementById("teacher_list");
const studentRegList = document.getElementById("student_registration_list");

addTeacherForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const tea_name = document.getElementById("teacher_name").value.trim();
    const tea_department = document.getElementById("teacher_department").value;
    const tea_subject = document.getElementById("teacher_subject").value.trim();
    const tea_email = document.getElementById("teacher_email").value.trim();

    const teacherData = {
        tea_name,
        tea_department,
        tea_subject,
        tea_email,
        tea_password: tea_email 
    };

    push(teacherRef, teacherData)
        .then(() => {
            alert("Teacher added successfully!");
            addTeacherForm.reset();
        })
        .catch(err => console.error("Error:", err));
});


onValue(teacherRef, (snapshot) => {
    teacherList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const teacher = childSnapshot.val();
        const teacherKey = childSnapshot.key;

        teacherList.innerHTML += `
            <tr>
                <td>${teacher.tea_name}</td>
                <td>${teacher.tea_department}</td>
                <td>${teacher.tea_subject}</td>
                <td>${teacher.tea_email}</td>
                <td>
                        <button onclick="updateTeacherPrompt(
                            '${teacherKey}', 
                            '${teacher.tea_username}', 
                            '${teacher.tea_password}', 
                            '${teacher.tea_department || ''}', 
                            '${teacher.tea_email || ''}'
                        )">Update</button>
                        <button onclick="deleteTeacher('${teacherKey}')">Delete</button>
                </td>
            </tr>
        `;
    });
});

window.updateTeacherPrompt = (key, username, password, department, email) => {
    const newUsername = prompt("Enter new username:", username);
    const newPassword = prompt("Enter new password:", password);
    const newDepartment = prompt("Enter new department:", department);
    const newEmail = prompt("Enter new email:", email);

    if (newUsername && newPassword && newDepartment && newEmail) {
        update(ref(database, `tea_users/${key}`), {
            tea_name: newUsername,
            tea_password: newPassword,
            tea_department: newDepartment,
            tea_email: newEmail,
        })
            .then(() => alert("Teacher details updated successfully!"))
            .catch((err) => console.error("Error:", err));
    } else {
        alert("All fields must be filled to update teacher details.");
    }
};


window.deleteTeacher = (key) => {
    remove(ref(database, `tea_users/${key}`))
        .then(() => alert("Teacher deleted successfully!"))
        .catch(err => console.error("Error:", err));
};


onValue(studentRegRef, (snapshot) => {
    studentRegList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const student = childSnapshot.val();
        const studentKey = childSnapshot.key;

        studentRegList.innerHTML += `
            <tr>
    <td>${student.stu_username}</td>
    <td>${student.stu_email}</td>
    <td>${student.stu_department}</td>
    <td>
        <button onclick="approveStudent('${studentKey}', '${student.stu_username}', '${student.stu_email}', '${student.stu_department}','${student.stu_password}')">
            Approve
        </button>
        <button onclick="denyStudent('${studentKey}')">Deny</button>
    </td>
</tr>
        `;
    });
});


window.approveStudent = (key, username, email, department,password) => {
    const approvedStudentData = {
        stu_username: username,
        stu_email: email,
        stu_department: department,
        stu_password: password 
    };
    set(ref(database, `std_users/${key}`), approvedStudentData)
        .then(() => {
            return remove(ref(database, `students_reg/${key}`));
        })
        .then(() => alert("Student approved and added to std_users!"))
        .catch(err => console.error("Error:", err));
};

window.denyStudent = (key) => {
    remove(ref(database, `students_reg/${key}`))
        .then(() => alert("Student denied!"))
        .catch(err => console.error("Error:", err));
};

const logoutBtn = document.querySelector("#logout");
logoutBtn.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "index.html";
});