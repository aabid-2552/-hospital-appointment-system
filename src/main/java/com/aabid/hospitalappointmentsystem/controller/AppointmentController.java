package com.aabid.hospitalappointmentsystem.controller;

import com.aabid.hospitalappointmentsystem.dto.BookAppointmentRequest;
import com.aabid.hospitalappointmentsystem.entity.Appointment;
import com.aabid.hospitalappointmentsystem.entity.AppointmentStatus;
import com.aabid.hospitalappointmentsystem.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(
            Authentication authentication,
            @RequestBody BookAppointmentRequest request) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not authenticated");
        }

        String email = authentication.getName();
        //System.out.println("Booking Request Received for User: " + email + " | Payload: " + request);

        Appointment appointment = appointmentService.bookAppointment(email, request);
        return ResponseEntity.ok(appointment);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Appointment>> getMyAppointments(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        return ResponseEntity.ok(appointmentService.getMyAppointments(email));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(
            @PathVariable Long doctorId,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorId, date));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }
    @GetMapping("/doctor/my")
    public ResponseEntity<List<Appointment>> getMyDoctorAppointments(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(appointmentService.getAppointmentsForDoctorEmail(email));
    }
}