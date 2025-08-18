package com.example.auth.service.impl;

import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.dto.AuthResponse;
import com.example.auth.exception.InvalidCredentialsException;
import com.example.user.dto.UserDto;
import com.example.user.entity.User;
import com.example.user.enums.UserRole;
import com.example.user.repository.UserRepository;
import com.example.user.service.UserService;
import com.example.auth.service.AuthService;
import com.example.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());
        
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration attempt with existing email: {}", request.getEmail());
            throw new InvalidCredentialsException("Email already registered");
        }
        
        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .build();
        
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());
        
        String token = jwtUtil.generateToken(savedUser.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .message("User registered successfully")
                .email(savedUser.getEmail())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for: {}", request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            log.warn("Login failed (account not found) for: {}", request.getEmail());
            throw new InvalidCredentialsException("User not found with the provided email address");
        }
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed (wrong password) for: {}", request.getEmail());
            throw new InvalidCredentialsException("Invalid password");
        }
        
        log.info("Login success for: {}", request.getEmail());
        
        String token = jwtUtil.generateToken(user.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .message("Login successful")
                .email(user.getEmail())
                .build();
    }

    @Override
    public AuthResponse createAdmin(RegisterRequest request) {
        log.info("Admin creation attempt for email: {}", request.getEmail());
        
        // Check if any admin already exists
        if (userRepository.findByRole(UserRole.ADMIN).isPresent()) {
            throw new InvalidCredentialsException("Admin user already exists");
        }
        
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidCredentialsException("Email already registered");
        }
        
        // Create admin user
        User adminUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(UserRole.ADMIN)
                .build();
        
        User savedAdmin = userRepository.save(adminUser);
        log.info("First admin user created: {}", savedAdmin.getEmail());
        
        String token = jwtUtil.generateToken(savedAdmin.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .message("Admin user created successfully")
                .email(savedAdmin.getEmail())
                .build();
    }

    @Override
    public UserDto getCurrentUser() {
        User currentUser = userService.getCurrentUser();
        return userService.getUserById(currentUser.getId()).orElse(null);
    }

    @Override
    public void logout() {
        // Stateless JWT: client should discard token. Nothing to invalidate server-side.
        log.info("Logout request processed");
    }
}
