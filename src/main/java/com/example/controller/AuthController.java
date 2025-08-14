package com.example.controller;

import com.example.dto.UserRequestDTO;
import com.example.entity.User;
import com.example.entity.UserRole;
import com.example.repository.UserRepository;
import com.example.exception.InvalidCredentialsException;
import com.example.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Api(tags = "Authentication", description = "Authentication endpoints for user registration, login, and logout")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil = new JwtUtil("change-this-secret", 1000L * 60 * 60);
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    @ApiOperation(value = "Register a new user", notes = "Creates a new user account and sends welcome email")
    public ResponseEntity<?> register(@Valid @RequestBody UserRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration attempt with existing email: {}", request.getEmail());
            return ResponseEntity.badRequest().body("Email already registered");
        }
        User user = new User(request.getName(), request.getEmail(), passwordEncoder.encode(request.getPassword()), request.getPhone());
        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());
        Map<String, String> res = new HashMap<>();
        res.put("token", jwtUtil.generateToken(user.getEmail()));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    @ApiOperation(value = "User login", notes = "Authenticates user credentials and returns JWT token")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        log.info("Login attempt for: {}", email);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            log.warn("Login failed (account not found) for: {}", email);
            throw new InvalidCredentialsException("User not found");
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.warn("Login failed (wrong password) for: {}", email);
            throw new InvalidCredentialsException("Invalid credentials");
        }
        log.info("Login success for: {}", email);
        Map<String, String> res = new HashMap<>();
        res.put("token", jwtUtil.generateToken(user.getEmail()));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/logout")
    @ApiOperation(value = "User logout", notes = "Logs out user")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String email = extractEmailFromBearer(authHeader);
        if (email != null) {
            log.info("Logout request for: {}", email);
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
    
    @PostMapping("/create-admin")
    @ApiOperation(value = "Create first admin user", notes = "Creates the first admin user (use only once)")
    public ResponseEntity<?> createFirstAdmin(@Valid @RequestBody UserRequestDTO request) {
        // Check if any admin already exists
        if (userRepository.findByRole(UserRole.ADMIN).isPresent()) {
            return ResponseEntity.badRequest().body("Admin user already exists");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        
        User adminUser = new User(request.getName(), request.getEmail(), 
                                passwordEncoder.encode(request.getPassword()), request.getPhone());
        adminUser.setRole(UserRole.ADMIN);
        userRepository.save(adminUser);
        
        log.info("First admin user created: {}", adminUser.getEmail());
        
        Map<String, String> res = new HashMap<>();
        res.put("token", jwtUtil.generateToken(adminUser.getEmail()));
        return ResponseEntity.ok(res);
    }
}


