package com.aabid.hospitalappointmentsystem.service;

import com.aabid.hospitalappointmentsystem.config.JwtUtil;
import com.aabid.hospitalappointmentsystem.dto.LoginRequest;
import com.aabid.hospitalappointmentsystem.dto.LoginResponse;
import com.aabid.hospitalappointmentsystem.entity.User;
import com.aabid.hospitalappointmentsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return new LoginResponse(token, user.getId(), user.getName(), user.getRole());
    }
}