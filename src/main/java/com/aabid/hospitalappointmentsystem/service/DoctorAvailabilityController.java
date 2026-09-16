package com.aabid.hospitalappointmentsystem.controller;

import com.aabid.hospitalappointmentsystem.dto.AvailabilityRequest;
import com.aabid.hospitalappointmentsystem.entity.DoctorAvailability;
import com.aabid.hospitalappointmentsystem.service.DoctorAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/doctors/{doctorId}/availability")
@RequiredArgsConstructor
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;

    @PostMapping
    public ResponseEntity<DoctorAvailability> addAvailability(
            @PathVariable Long doctorId,
            @RequestBody AvailabilityRequest request) {
        return ResponseEntity.ok(availabilityService.addAvailability(doctorId, request));
    }

    @GetMapping("/{dayOfWeek}")
    public ResponseEntity<List<DoctorAvailability>> getAvailability(
            @PathVariable Long doctorId,
            @PathVariable DayOfWeek dayOfWeek) {
        return ResponseEntity.ok(availabilityService.getAvailabilityByDoctor(doctorId, dayOfWeek));
    }
}