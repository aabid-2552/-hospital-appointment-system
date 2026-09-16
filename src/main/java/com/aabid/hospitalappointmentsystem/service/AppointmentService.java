package com.aabid.hospitalappointmentsystem.service;

import com.aabid.hospitalappointmentsystem.dto.BookAppointmentRequest;
import com.aabid.hospitalappointmentsystem.entity.*;
import com.aabid.hospitalappointmentsystem.repository.AppointmentRepository;
import com.aabid.hospitalappointmentsystem.repository.DoctorRepository;
import com.aabid.hospitalappointmentsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public Appointment bookAppointment(String patientEmail, BookAppointmentRequest request) {

        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        boolean alreadyBooked = appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                request.getDoctorId(), request.getAppointmentDate(), request.getAppointmentTime());

        if (alreadyBooked) {
            throw new RuntimeException("This slot is already booked. Please choose another time.");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getMyAppointments(String patientEmail) {
        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return appointmentRepository.findByPatientId(patient.getId());
    }

    public List<Appointment> getDoctorAppointments(Long doctorId, java.time.LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
    }

    public Appointment updateStatus(Long appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }
}