package com.aabid.hospitalappointmentsystem.dto;

import com.aabid.hospitalappointmentsystem.entity.Role;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private String name;
    private Role role;
}