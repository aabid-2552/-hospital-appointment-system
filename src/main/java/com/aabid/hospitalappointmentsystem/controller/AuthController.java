package com.aabid.hospitalappointmentsystem.controller;


import com.aabid.hospitalappointmentsystem.dto.LoginRequest;
import com.aabid.hospitalappointmentsystem.dto.LoginResponse;
import com.aabid.hospitalappointmentsystem.dto.RegisterRequest;
import com.aabid.hospitalappointmentsystem.dto.UserResponse;
import com.aabid.hospitalappointmentsystem.service.AuthService;
import com.aabid.hospitalappointmentsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final AuthService authService;


    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        UserResponse response= userService.registerUser(request);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
