package com.aabid.hospitalappointmentsystem.dto;

import lombok.Data;

@Data
public class DoctorRegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String specialization;
    private Integer experienceYears;
}