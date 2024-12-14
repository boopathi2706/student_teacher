import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const appSetting = { 
    databaseURL: "https://student-teacher-project-e28b9-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSetting);
const database = getDatabase(app);

const teaRef = ref(database, "tea_users");
const appointmentsRef = ref(database, "appointments");

// Elements
const studentWelcome = document.querySelector("#studentWelcome");
const teacherList = document.querySelector("#teacherList");
const searchTeacher = document.querySelector("#searchTeacher");
const logoutBtn = document.querySelector("#logout");

// Retrieve student details
const studentDetails = JSON.parse(sessionStorage.getItem("studentDetails"));

// Display Student Welcome Message
if (studentDetails) {
    studentWelcome.textContent = `Welcome, ${studentDetails.stu_username}`;
} else {
    alert("No student details found. Please log in again.");
    window.location.href = "index.html";
}

// Fetch and Display Teachers
onValue(teaRef, (snapshot) => {
    teacherList.innerHTML = ""; // Clear table
    if (snapshot.exists()) {
        const teachers = snapshot.val();
        Object.keys(teachers).forEach((key) => {
            const teacher = teachers[key];
            addTeacherRow(key, teacher);
        });
    }
});

function addTeacherRow(key, teacher) {
    const row = `
        <tr>
            <td>${teacher.tea_name}</td>
            <td>${teacher.tea_department}</td>
            <td>${teacher.tea_subject}</td>
            <td>${teacher.tea_email}</td>
            <td>
                <button class="book-btn" onclick="bookAppointment('${key}', '${teacher.tea_name}', '${teacher.tea_email}')">Book Appointment</button>
                <button class="msg-btn" onclick="sendMessage('${key}', '${teacher.tea_email}')">Send Message</button>
            </td>
        </tr>
    `;
    teacherList.innerHTML += row;
}

// Send Message to Teacher and Store in Database
window.sendMessage = (teacherKey, teacherEmail) => {
    // Ask for confirmation before sending a message
    const confirmSend = confirm(`Do you want to send a message to ${teacherEmail}?`);
    if (!confirmSend) {
        return; // Exit the function if the student cancels
    }

    // Ask what message to send
    const message = prompt(`What message would you like to send to ${teacherEmail}?`);
    if (!message || message.trim() === "") {
        alert("Message cannot be empty. Please try again.");
        return;
    }

    // Prepare message data
    const messageData = {
        sender_email: studentDetails.stu_email, // Current student's email
        sender_name: studentDetails.stu_username, // Current student's name
        message: message,
        viewed: false, // Indicates the teacher hasn't seen the message
        timestamp: new Date().toISOString(),
    };

    // Reference to the teacher's messages in Firebase
    const teacherMessagesRef = ref(database, `tea_users/${teacherKey}/messages`);

    // Push the message into Firebase
    push(teacherMessagesRef, messageData)
        .then(() => {
            alert(`Your message has been sent successfully to ${teacherEmail}!`);
        })
        .catch((err) => {
            console.error("Error sending message:", err);
            alert("Failed to send the message. Please try again.");
        });
};



// Search Teacher
searchTeacher.addEventListener("input", () => {
    const searchText = searchTeacher.value.toLowerCase();
    teacherList.innerHTML = "";

    onValue(teaRef, (snapshot) => {
        if (snapshot.exists()) {
            const teachers = snapshot.val();
            Object.keys(teachers).forEach((key) => {
                const teacher = teachers[key];
                if (teacher.tea_name.toLowerCase().includes(searchText)) {
                    addTeacherRow(key, teacher);
                }
            });
        }
    });
});

// Book Appointment
window.bookAppointment = (teacherKey, teacherName, teacherEmail) => {
    const appointmentDetails = {
        student_email: studentDetails.stu_email,
        student_name: studentDetails.stu_username,
        teacher_email: teacherEmail,
        teacher_name: teacherName,
        status: "Pending",
    };

    push(appointmentsRef, appointmentDetails)
        .then(() => alert("Appointment sent successfully!"))
        .catch((err) => console.error("Error:", err));
};



// Logout
logoutBtn.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "index.html";
});
