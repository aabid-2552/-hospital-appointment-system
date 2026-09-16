package com.aabid.hospitalappointmentsystem.repository;

import com.aabid.hospitalappointmentsystem.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);

    List<Appointment> findByPatientId(Long patientId);

    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTime(
            Long doctorId, LocalDate appointmentDate, LocalTime appointmentTime);
}