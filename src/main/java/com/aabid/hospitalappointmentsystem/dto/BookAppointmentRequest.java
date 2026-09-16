package com.aabid.hospitalappointmentsystem.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookAppointmentRequest {
    private Long doctorId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
}
