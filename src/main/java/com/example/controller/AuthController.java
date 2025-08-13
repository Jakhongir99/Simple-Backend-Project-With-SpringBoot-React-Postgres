package com.example.controller;

import com.example.dto.UserRequestDTO;
import com.example.entity.User;
import com.example.repository.UserRepository;
import com.example.security.JwtUtil;
import com.example.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil = new JwtUtil("change-this-secret", 1000L * 60 * 60);
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final EmailService emailService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration attempt with existing email: {}", request.getEmail());
            return ResponseEntity.badRequest().body("Email already registered");
        }
        User user = new User(request.getName(), request.getEmail(), passwordEncoder.encode(request.getPassword()), request.getPhone());
        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());
        emailService.send(user.getEmail(), "Welcome to Java Simple App", "Your account has been created successfully.");
        Map<String, String> res = new HashMap<>();
        res.put("token", jwtUtil.generateToken(user.getEmail()));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String customMessage = body.get("message");
        log.info("Login attempt for: {}", email);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
             log.warn("Login failed for: {}", email);
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        log.info("Login success for: {}", email);
        emailService.send(email, "Login notification", "You have successfully logged in.");
        if (customMessage != null && !customMessage.trim().isEmpty()) {
            emailService.send(email, "Your message", customMessage.trim());
        }
        Map<String, String> res = new HashMap<>();
        res.put("token", jwtUtil.generateToken(user.getEmail()));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String email = extractEmailFromBearer(authHeader);
        if (email != null) {
            log.info("Logout request for: {}", email);
            emailService.send(email, "Logout notification", "You have successfully logged out.");
        } else {
            log.info("Logout request with no/invalid token");
        }
        // Stateless JWT: client should discard token. Nothing to invalidate server-side.
        return ResponseEntity.ok().build();
    }

    private String extractEmailFromBearer(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        try {
            return jwtUtil.extractUsername(token);
        } catch (Exception e) {
            return null;
        }
    }

    
}


