package com.example.auth.controller;

import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.dto.AuthResponse;
import com.example.auth.service.AuthService;
import com.example.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during registration: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during login: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        try {
            authService.logout();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error during logout: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
    
    @PostMapping("/create-admin")
    public ResponseEntity<AuthResponse> createFirstAdmin(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.createAdmin(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating admin: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        try {
            UserDto currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(currentUser);
        } catch (Exception e) {
            log.error("Error getting current user: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/debug-token")
    public ResponseEntity<Map<String, Object>> debugToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Debug token request received with auth header: {}", authHeader != null ? "present" : "absent");
        
        Map<String, Object> response = new HashMap<>();
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("status", "no_token");
            response.put("message", "No Authorization header or invalid format");
            return ResponseEntity.ok(response);
        }
        
        response.put("status", "token_present");
        response.put("message", "Token header received");
        response.put("tokenLength", authHeader.length());
        
        return ResponseEntity.ok(response);
    }
}
