// ===== Config =====
const API_BASE = "/api";
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
    if (auth) {
        const token = getToken();
        if (!token) {
            window.location.href = "login.html";
            throw new Error("Please log in again.");
        }
        headers["Authorization"] = "Bearer " + token;
    }

    const res = await fetch(API_BASE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    if (res.status === 403) {
        clearSession();
        window.location.href = "login.html";
        throw new Error("Session expired. Please sign in again.");
    }

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : null;

    if (!res.ok) {
        const message = (data && (data.error || data.message)) ? (data.error || data.message) : "Something went wrong. Please try again.";
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
        if (errorBox) errorBox.classList.add("hidden");

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
            if (errorBox) {
                errorBox.textContent = err.message;
                errorBox.classList.remove("hidden");
            }
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

    if (patientBtn && doctorBtn) {
        patientBtn.addEventListener("click", () => setRole("PATIENT"));
        doctorBtn.addEventListener("click", () => setRole("DOCTOR"));
    }

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById("form-error");
        const successBox = document.getElementById("form-success");
        if (errorBox) errorBox.classList.add("hidden");
        if (successBox) successBox.classList.add("hidden");

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

            if (successBox) {
                successBox.textContent = "Account created. Redirecting to sign in...";
                successBox.classList.remove("hidden");
            }
            setTimeout(() => (window.location.href = "login.html"), 1200);
        } catch (err) {
            if (errorBox) {
                errorBox.textContent = err.message;
                errorBox.classList.remove("hidden");
            }
            submitBtn.disabled = false;
            submitBtn.textContent = "Create account";
        }
    });
}

// ===== DASHBOARD PAGE =====
const dashboardShell = document.getElementById("dashboard-shell");
if (dashboardShell) {
    requireAuth();

    const role = localStorage.getItem("role");
    const isDoctor = role === "DOCTOR";

    const nameElem = document.getElementById("user-name");
    const roleElem = document.getElementById("user-role");
    if (nameElem) nameElem.textContent = localStorage.getItem("name") || "there";
    if (roleElem) roleElem.textContent = role || "";

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            clearSession();
            window.location.href = "login.html";
        });
    }

    // ---- DOCTOR: Hide "Find a doctor" tab, go straight to appointments ----
    if (isDoctor) {
        const navDoctorsBtn = document.getElementById("nav-doctors");
        if (navDoctorsBtn) navDoctorsBtn.classList.add("hidden");

        document.getElementById("view-doctors").classList.remove("active");
        document.getElementById("view-appointments").classList.add("active");
        document.querySelector('[data-view="view-appointments"]').classList.add("active");

        document.getElementById("appointments-title").textContent = "My patients";
        document.getElementById("appointments-sub").textContent = "Appointments booked with you.";
    }

    const navButtons = document.querySelectorAll(".sidebar-nav button");
    const views = document.querySelectorAll(".view");

    navButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            navButtons.forEach((b) => b.classList.remove("active"));
            views.forEach((v) => v.classList.remove("active"));
            btn.classList.add("active");

            const targetView = document.getElementById(btn.dataset.view);
            if (targetView) targetView.classList.add("active");

            if (btn.dataset.view === "view-appointments") loadAppointments();
            if (btn.dataset.view === "view-doctors") loadDoctors();
        });
    });

    let allDoctors = [];

    async function loadDoctors() {
        const list = document.getElementById("doctor-list");
        if (!list) return;
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
        if (!list) return;
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

    const searchInput = document.getElementById("doctor-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            renderDoctors(allDoctors.filter(d =>
                (d.user?.name || "").toLowerCase().includes(term) ||
                (d.specialization || "").toLowerCase().includes(term)
            ));
        });
    }

    window.openBookingModal = function (doctorId, doctorName) {
        document.getElementById("modal-doctor-name").textContent = "Dr. " + doctorName;
        document.getElementById("booking-doctor-id").value = doctorId;
        document.getElementById("booking-modal").classList.remove("hidden");
    };

    const cancelModalBtn = document.getElementById("modal-cancel");
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener("click", () => {
            document.getElementById("booking-modal").classList.add("hidden");
        });
    }

    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const errorBox = document.getElementById("booking-error");
            if (errorBox) errorBox.classList.add("hidden");

            const doctorId = Number(document.getElementById("booking-doctor-id").value);
            const appointmentDate = document.getElementById("booking-date").value;

            let rawTime = document.getElementById("booking-time").value;
            let appointmentTime = rawTime;
            if (rawTime && rawTime.length === 5) {
                appointmentTime = rawTime + ":00";
            }

            const submitBtn = document.getElementById("booking-submit");
            submitBtn.disabled = true;
            submitBtn.textContent = "Booking...";

            try {
                await apiCall("/appointments/book", "POST",
                    { doctorId, appointmentDate, appointmentTime }, true);

                document.getElementById("booking-modal").classList.add("hidden");
                bookingForm.reset();

                navButtons.forEach(b => b.classList.remove("active"));
                views.forEach(v => v.classList.remove("active"));

                const apptNavBtn = document.querySelector('[data-view="view-appointments"]');
                const apptView = document.getElementById("view-appointments");
                if (apptNavBtn) apptNavBtn.classList.add("active");
                if (apptView) apptView.classList.add("active");

                loadAppointments();
            } catch (err) {
                if (errorBox) {
                    errorBox.textContent = err.message;
                    errorBox.classList.remove("hidden");
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Confirm booking";
            }
        });
    }

    // ---- Load appointments (different endpoint + rendering for doctor vs patient) ----
    async function loadAppointments() {
        const list = document.getElementById("appointment-list");
        if (!list) return;
        list.innerHTML = `<p style="color:var(--ink-soft)">Loading...</p>`;
        try {
            const endpoint = isDoctor ? "/appointments/doctor/my" : "/appointments/my";
            const appointments = await apiCall(endpoint, "GET", null, true);
            if (isDoctor) {
                renderDoctorAppointments(appointments);
            } else {
                renderAppointments(appointments);
            }
        } catch (err) {
            list.innerHTML = `<div class="form-error">${err.message}</div>`;
        }
    }

    // ---- Patient view: appointments with doctor info ----
    function renderAppointments(appointments) {
        const list = document.getElementById("appointment-list");
        if (!list) return;
        if (!appointments.length) {
            list.innerHTML = `<div class="empty-state"><h3>No appointments yet</h3><p>Book a visit with a doctor to see it here.</p></div>`;
            return;
        }
        const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        list.innerHTML = appointments.map((appt) => {
            const dateParts = appt.appointmentDate.split("-");
            const day = dateParts[2];
            const monthIdx = parseInt(dateParts[1], 10) - 1;
            return `
        <div class="appt-card">
          <div class="appt-date-block">
            <div class="day">${day}</div>
            <div class="mon">${months[monthIdx]}</div>
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

    // ---- Doctor view: appointments with patient info + status change dropdown ----
    function renderDoctorAppointments(appointments) {
        const list = document.getElementById("appointment-list");
        if (!list) return;
        if (!appointments.length) {
            list.innerHTML = `<div class="empty-state"><h3>No appointments yet</h3><p>Patients who book a visit with you will show up here.</p></div>`;
            return;
        }
        const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

        list.innerHTML = appointments.map((appt) => {
            const dateParts = appt.appointmentDate.split("-");
            const day = dateParts[2];
            const monthIdx = parseInt(dateParts[1], 10) - 1;
            const options = statuses.map(s =>
                `<option value="${s}" ${appt.status === s ? "selected" : ""}>${s}</option>`
            ).join("");

            return `
        <div class="appt-card">
          <div class="appt-date-block">
            <div class="day">${day}</div>
            <div class="mon">${months[monthIdx]}</div>
          </div>
          <div class="appt-details">
            <div class="title">${appt.patient?.name || "Unknown patient"}</div>
            <div class="sub">${appt.patient?.phone || ""} &middot; ${appt.appointmentTime}</div>
          </div>
          <select class="status-select" data-id="${appt.id}" style="padding:0.4rem 0.6rem; border-radius:6px; border:1px solid var(--line); font-family:var(--font-body);">
            ${options}
          </select>
        </div>
      `;
        }).join("");

        document.querySelectorAll(".status-select").forEach(select => {
            select.addEventListener("change", async (e) => {
                const appointmentId = e.target.dataset.id;
                const newStatus = e.target.value;
                try {
                    await apiCall(`/appointments/${appointmentId}/status?status=${newStatus}`, "PUT", null, true);
                } catch (err) {
                    alert("Could not update status: " + err.message);
                    loadAppointments();
                }
            });
        });
    }

    // Initial load
    if (isDoctor) {
        loadAppointments();
    } else {
        loadDoctors();
    }
}