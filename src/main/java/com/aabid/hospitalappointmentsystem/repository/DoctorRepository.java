package com.aabid.hospitalappointmentsystem.repository;

import com.aabid.hospitalappointmentsystem.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor,Long> {
    List<Doctor> findBySpecialization(String specialization);
}
