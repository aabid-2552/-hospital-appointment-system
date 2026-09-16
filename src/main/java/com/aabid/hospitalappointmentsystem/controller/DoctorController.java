package com.aabid.hospitalappointmentsystem.controller;

import com.aabid.hospitalappointmentsystem.dto.DoctorRegisterRequest;
import com.aabid.hospitalappointmentsystem.entity.Doctor;
import com.aabid.hospitalappointmentsystem.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/register")
    public ResponseEntity<Doctor> registerDoctor(@RequestBody DoctorRegisterRequest request) {
        return ResponseEntity.ok(doctorService.registerDoctor(request));
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<Doctor>> getBySpecialization(@PathVariable String specialization) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialization(specialization));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }
}