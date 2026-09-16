// ===== Config =====
const API_BASE = "http://localhost:8080/api";

// ===== Token helpers =====
function saveSession(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("name", data.name);
    localStorage.setItem("role", data.role);
}

function getToken() {
    return localStorage.getItem("token");
}

function clearSession() {
    localStorage.clear();
}

function requireAuth() {
    if (!getToken()) {
        window.location.href = "login.html";
    }
}

// ===== Generic API call wrapper =====
async function apiCall(path, method = "GET", body = null, auth = false) {
    const headers = { "Content-Type": "application/json" };
    if (auth) headers["Authorization"] = "Bearer " + getToken();

    const res = await fetch(API_BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : null;

    if (!res.ok) {
        const message = (data && data.error) ? data.error : "Something went wrong. Please try again.";
        throw new Error(message);
    }
    return data;
}

// ===== LOGIN PAGE =====
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("form-error");
        errorBox.classList.add("hidden");

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const submitBtn = loginForm.querySelector("button[type=submit]");

        submitBtn.disabled = true;
        submitBtn.textContent = "Signing in...";

        try {
            const data = await apiCall("/auth/login", "POST", { email, password });
            saveSession(data);
            window.location.href = "dashboard.html";
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.classList.remove("hidden");
            submitBtn.disabled = false;
            submitBtn.textContent = "Sign in";
        }
    });
}

// ===== REGISTER PAGE =====
const registerForm = document.getElementById("register-form");
if (registerForm) {
    let selectedRole = "PATIENT";

    const patientBtn = document.getElementById("role-patient");
    const doctorBtn = document.getElementById("role-doctor");
    const doctorFields = document.getElementById("doctor-fields");

    function setRole(role) {
        selectedRole = role;
        patientBtn.classList.toggle("active", role === "PATIENT");
        doctorBtn.classList.toggle("active", role === "DOCTOR");
        doctorFields.classList.toggle("hidden", role !== "DOCTOR");
    }

    patientBtn.addEventListener("click", () => setRole("PATIENT"));
    doctorBtn.addEventListener("click", () => setRole("DOCTOR"));

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("form-error");
        const successBox = document.getElementById("form-success");
        errorBox.classList.add("hidden");
        successBox.classList.add("hidden");

        const submitBtn = registerForm.querySelector("button[type=submit]");
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating account...";

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const phone = document.getElementById("phone").value.trim();

        try {
            if (selectedRole === "PATIENT") {
                await apiCall("/auth/register", "POST", { name, email, password, phone, role: "PATIENT" });
            } else {
                const specialization = document.getElementById("specialization").value.trim();
                const experienceYears = Number(document.getElementById("experienceYears").value);
                await apiCall("/doctors/register", "POST", {
                    name, email, password, phone, specialization, experienceYears
                });
            }

            successBox.textContent = "Account created. Redirecting to sign in...";
            successBox.classList.remove("hidden");
            setTimeout(() => (window.location.href = "login.html"), 1200);
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.classList.remove("hidden");
            submitBtn.disabled = false;
            submitBtn.textContent = "Create account";
        }
    });
}

// ===== DASHBOARD PAGE =====
const dashboardShell = document.getElementById("dashboard-shell");
if (dashboardShell) {
    requireAuth();

    document.getElementById("user-name").textContent = localStorage.getItem("name") || "there";
    document.getElementById("user-role").textContent = localStorage.getItem("role") || "";

    document.getElementById("logout-btn").addEventListener("click", () => {
        clearSession();
        window.location.href = "login.html";
    });

    const navButtons = document.querySelectorAll(".sidebar-nav button");
    const views = document.querySelectorAll(".view");

    navButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            navButtons.forEach((b) => b.classList.remove("active"));
            views.forEach((v) => v.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(btn.dataset.view).classList.add("active");

            if (btn.dataset.view === "view-appointments") loadAppointments();
            if (btn.dataset.view === "view-doctors") loadDoctors();
        });
    });

    let allDoctors = [];

    async function loadDoctors() {
        const list = document.getElementById("doctor-list");
        list.innerHTML = `<p style="color:var(--ink-soft)">Loading doctors...</p>`;
        try {
            allDoctors = await apiCall("/doctors", "GET", null, true);
            renderDoctors(allDoctors);
        } catch (err) {
            list.innerHTML = `<div class="form-error">${err.message}</div>`;
        }
    }

    function renderDoctors(doctors) {
        const list = document.getElementById("doctor-list");
        if (!doctors.length) {
            list.innerHTML = `<div class="empty-state"><h3>No doctors found</h3><p>Try a different search term.</p></div>`;
            return;
        }
        list.innerHTML = doctors.map((doc) => {
            const initials = (doc.user?.name || "DR").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            return `
        <div class="doctor-row">
          <div class="doctor-info">
            <div class="doctor-avatar">${initials}</div>
            <div>
              <div class="doctor-name">Dr. ${doc.user?.name || "Unknown"}</div>
              <div class="doctor-meta">
                <span class="tag">${doc.specialization}</span>
                &nbsp;${doc.experienceYears} yrs experience
              </div>
            </div>
          </div>
          <button class="btn btn-primary" onclick="openBookingModal(${doc.id}, '${(doc.user?.name || '').replace(/'/g, "")}')">Book visit</button>
        </div>
      `;
        }).join("");
    }

    document.getElementById("doctor-search").addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        renderDoctors(allDoctors.filter(d =>
            (d.user?.name || "").toLowerCase().includes(term) ||
            (d.specialization || "").toLowerCase().includes(term)
        ));
    });

    window.openBookingModal = function (doctorId, doctorName) {
        document.getElementById("modal-doctor-name").textContent = "Dr. " + doctorName;
        document.getElementById("booking-doctor-id").value = doctorId;
        document.getElementById("booking-modal").classList.remove("hidden");
    };

    document.getElementById("modal-cancel").addEventListener("click", () => {
        document.getElementById("booking-modal").classList.add("hidden");
    });

    document.getElementById("booking-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("booking-error");
        errorBox.classList.add("hidden");

        const doctorId = Number(document.getElementById("booking-doctor-id").value);
        const appointmentDate = document.getElementById("booking-date").value;
        const appointmentTime = document.getElementById("booking-time").value;
        const submitBtn = document.getElementById("booking-submit");

        submitBtn.disabled = true;
        submitBtn.textContent = "Booking...";

        try {
            await apiCall("/appointments/book", "POST",
                { doctorId, appointmentDate, appointmentTime }, true);
            document.getElementById("booking-modal").classList.add("hidden");
            document.getElementById("booking-form").reset();
            navButtons.forEach(b => b.classList.remove("active"));
            views.forEach(v => v.classList.remove("active"));
            document.querySelector('[data-view="view-appointments"]').classList.add("active");
            document.getElementById("view-appointments").classList.add("active");
            loadAppointments();
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.classList.remove("hidden");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Confirm booking";
        }
    });

    async function loadAppointments() {
        const list = document.getElementById("appointment-list");
        list.innerHTML = `<p style="color:var(--ink-soft)">Loading your appointments...</p>`;
        try {
            const appointments = await apiCall("/appointments/my", "GET", null, true);
            renderAppointments(appointments);
        } catch (err) {
            list.innerHTML = `<div class="form-error">${err.message}</div>`;
        }
    }

    function renderAppointments(appointments) {
        const list = document.getElementById("appointment-list");
        if (!appointments.length) {
            list.innerHTML = `<div class="empty-state"><h3>No appointments yet</h3><p>Book a visit with a doctor to see it here.</p></div>`;
            return;
        }
        const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        list.innerHTML = appointments.map((appt) => {
            const d = new Date(appt.appointmentDate);
            return `
        <div class="appt-card">
          <div class="appt-date-block">
            <div class="day">${d.getDate()}</div>
            <div class="mon">${months[d.getMonth()]}</div>
          </div>
          <div class="appt-details">
            <div class="title">Dr. ${appt.doctor?.user?.name || "Unknown"}</div>
            <div class="sub">${appt.doctor?.specialization || ""} &middot; ${appt.appointmentTime}</div>
          </div>
          <span class="status-badge status-${appt.status}">${appt.status}</span>
        </div>
      `;
        }).join("");
    }

    loadDoctors();
}