import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://student-teacher-project-e28b9-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Teacher Details
const teacherDetails = JSON.parse(sessionStorage.getItem("teacherDetails")) || {};
const teacherEmail = teacherDetails.tea_email || "";
const teacherName = teacherDetails.tea_name || "Teacher";
document.querySelector("#teacher-name").textContent = teacherName;

// View Pending Appointments
window.viewMessages = () => {
    const content = document.getElementById("content");
    content.innerHTML = "<h3>Pending Appointments</h3>";

    const appointmentsRef = ref(database, "appointments");
    onValue(appointmentsRef, (snapshot) => {
        let hasData = false;
        let tableContent = `
            <table>
                <tr>
                    <th>Student Name</th>
                    <th>Student Email</th>
                    <th>Actions</th>
                </tr>
        `;

        snapshot.forEach((child) => {
            const data = child.val();
            const key = child.key;

            if (data.teacher_email === teacherEmail && data.status === "Pending") {
                hasData = true;
                tableContent += `
                    <tr>
                        <td>${data.student_name}</td>
                        <td>${data.student_email}</td>
                        <td>
                            <button class="accept" onclick="acceptAppointment('${key}', '${data.student_email}')">Accept</button>
                            <button class="deny" onclick="denyAppointment('${key}')">Deny</button>
                        </td>
                    </tr>
                `;
            }
        });

        tableContent += "</table>";
        content.innerHTML = hasData ? tableContent : `<p class="no-data">No Pending Appointments</p>`;
    });
};

// Accept Appointment
window.acceptAppointment = (key, studentEmail) => {
    const appointmentRef = ref(database, `appointments/${key}`);
    const teacherAcceptedRef = ref(database, `tea_users/${teacherEmail.replace(".", "_")}/acceptedAppointments`);
    const studentAcceptedRef = ref(database, `std_users/${studentEmail.replace(".", "_")}/acceptedAppointments`);

    onValue(appointmentRef, (snapshot) => {
        const appointment = snapshot.val();

        // Add to accepted appointments for teacher and student
        push(teacherAcceptedRef, appointment);
        push(studentAcceptedRef, appointment);

        // Remove from pending appointments
        remove(appointmentRef).then(() => {
            alert("Appointment Accepted!");
            viewMessages();
        });
    }, { onlyOnce: true });
};

// Deny Appointment
window.denyAppointment = (key) => {
    const appointmentRef = ref(database, `appointments/${key}`);
    remove(appointmentRef).then(() => {
        alert("Appointment Denied!");
        viewMessages();
    });
};

// View Accepted Appointments
window.viewAcceptedAppointments = () => {
    const content = document.getElementById("content");
    content.innerHTML = "<h3>Accepted Appointments</h3>";

    const teacherAcceptedRef = ref(database, `tea_users/${teacherEmail.replace(".", "_")}/acceptedAppointments`);
    onValue(teacherAcceptedRef, (snapshot) => {
        let hasData = false;
        let tableContent = `
            <table>
                <tr>
                    <th>Student Name</th>
                    <th>Student Email</th>
                </tr>
        `;

        snapshot.forEach((child) => {
            const data = child.val();
            hasData = true;
            tableContent += `
                <tr>
                    <td>${data.student_name}</td>
                    <td>${data.student_email}</td>
                </tr>
            `;
        });

        tableContent += "</table>";
        content.innerHTML = hasData ? tableContent : `<p class="no-data">No Accepted Appointments</p>`;
    });
};

window.viewMessages1 = () => {
    const messagesRef = ref(database, `tea_users/${teacherDetails.key}/messages`);
    onValue(messagesRef, (snapshot) => {
        content.innerHTML = "<h3>Messages from Students</h3>";
        if (!snapshot.exists()) {
            content.innerHTML += "<p>No messages available.</p>";
            return;
        }

        let table = `<table><tr><th>Student</th><th>Email</th><th>Message</th></tr>`;
        snapshot.forEach((childSnapshot) => {
            const msg = childSnapshot.val();
            table += `<tr><td>${msg.sender_name}</td><td>${msg.sender_email}</td><td>${msg.message}</td></tr>`;
        });
        table += "</table>";
        content.innerHTML = table;
    });
};

const logoutBtn = document.querySelector("#logout");
logoutBtn.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "index.html";
});