package com.aabid.hospitalappointmentsystem.dto;

import com.aabid.hospitalappointmentsystem.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private Role role;
}
