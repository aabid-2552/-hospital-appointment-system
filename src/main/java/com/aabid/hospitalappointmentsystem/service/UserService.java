package com.aabid.hospitalappointmentsystem.service;

import com.aabid.hospitalappointmentsystem.dto.RegisterRequest;
import com.aabid.hospitalappointmentsystem.dto.UserResponse;
import com.aabid.hospitalappointmentsystem.entity.Role;
import com.aabid.hospitalappointmentsystem.entity.User;
import com.aabid.hospitalappointmentsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse registerUser(RegisterRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            throw  new RuntimeException("Email already exists");

        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole()
        );
    }

}
