package com.aabid.hospitalappointmentsystem.service;

import com.aabid.hospitalappointmentsystem.dto.AvailabilityRequest;
import com.aabid.hospitalappointmentsystem.entity.Doctor;
import com.aabid.hospitalappointmentsystem.entity.DoctorAvailability;
import com.aabid.hospitalappointmentsystem.repository.DoctorAvailabilityRepository;
import com.aabid.hospitalappointmentsystem.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;

    public DoctorAvailability addAvailability(Long doctorId, AvailabilityRequest request) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctor(doctor);
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());

        return availabilityRepository.save(availability);
    }

    public List<DoctorAvailability> getAvailabilityByDoctor(Long doctorId, DayOfWeek dayOfWeek) {
        return availabilityRepository.findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek);
    }
}