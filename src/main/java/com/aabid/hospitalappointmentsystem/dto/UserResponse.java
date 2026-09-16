package com.aabid.hospitalappointmentsystem.dto;

import com.aabid.hospitalappointmentsystem.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private  Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
}
