package com.aabid.hospitalappointmentsystem.repository;

import com.aabid.hospitalappointmentsystem.entity.Doctor;
import com.aabid.hospitalappointmentsystem.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability,Long> {
    List<DoctorAvailability> findByDoctorIdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);
}
