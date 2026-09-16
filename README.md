# 🏥 Hospital Appointment Management System

A full-stack, enterprise-grade web application built using **Java (Spring Boot 3)**, **PostgreSQL**, **Spring Security with JWT Authentication**, and a lightweight **JavaScript (Fetch API) / HTML5 / CSS3** frontend.

The system automates hospital scheduling workflows, allowing patients to register and book appointments, doctors to manage weekly availability slots, and administrators to oversee system roles and appointments.

---

## ✨ Key Features

### 🔐 Authentication & Authorization (RBAC)
- **Stateless JWT Security:** Secure authentication mechanism using JSON Web Tokens.
- **Role-Based Access Control:** Distinct user permissions for `PATIENT`, `DOCTOR`, and `ADMIN`.
- **BCrypt Password Encoding:** Industry-standard password hashing before storing in PostgreSQL.

### 🩺 Doctor Scheduling Engine
- **Profile Management:** Medical specialists categorized by specialization, department, and contact info.
- **Dynamic Weekly Availability:** Doctors can configure recurring available slots (`DayOfWeek`, `startTime`, `endTime`).

### 📅 Appointment State Engine
- **Slot Booking:** Real-time appointment requests submitted by patients for specific dates and time slots.
- **Status Transitions:** Automated lifecycle handling (`PENDING` ➔ `CONFIRMED` ➔ `COMPLETED` / `CANCELLED` / `NO_SHOW`).
- **JPA Lifecycle Callbacks:** Uses `@PrePersist` to automatically generate creation timestamps (`createdAt`) and set default initial statuses.

### 💻 Responsive Web Portal
- Lightweight Single Page Interface using HTML5, CSS3, and ES6+ Vanilla JavaScript.
- Async API handling via modern browser `Fetch API` with local storage JWT token handling.

---

## 🛠️ Tech Stack

| Domain | Tech Stack |
| :--- | :--- |
| **Backend Framework** | Java 17+, Spring Boot 3.x, Spring Data JPA, Spring Security |
| **Security & Auth** | JSON Web Token (JWT), BCrypt Password Encoder |
| **Database** | PostgreSQL |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+ / Fetch API) |
| **Build Tool** | Apache Maven |
| **Boilerplate Reduction**| Lombok |

---

## 🏗️ Project Architecture

``text
com.aabid.hospitalappointmentsystem
 ├── config/                 # JWT Filters & Spring Security Setup
 │    ├── JwtFilter.java
 │    ├── JwtUtil.java
 │    └── SecurityConfig.java
 ├── controller/             # REST Endpoints (Auth, Doctor, Appointment)
 │    ├── AppointmentController.java
 │    ├── AuthController.java
 │    └── DoctorController.java
 ├── dto/                    # Request/Response Data Objects
 │    ├── BookAppointmentRequest.java
 │    ├── DoctorRegisterRequest.java
 │    ├── LoginRequest.java
 │    └── LoginResponse.java
 ├── entity/                 # Database Tables & JPA Mappings
 │    ├── Appointment.java
 │    ├── Doctor.java
 │    ├── DoctorAvailability.java
 │    └── User.java
 ├── exception/              # Centralized Error Handling (@ControllerAdvice)
 │    └── GlobalExceptionHandler.java
 ├── repository/             # Spring Data JPA Repositories
 └── service/                # Core Business Logic Layer
