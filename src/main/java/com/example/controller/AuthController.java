package com.example.controller;

import com.example.dto.UserRequestDTO;
import com.example.entity.User;
import com.example.repository.UserRepository;
import com.example.security.JwtUtil;
import com.example.service.TwoFactorService;
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
    private final TwoFactorService twoFactorService;
    private final JwtUtil jwtUtil = new JwtUtil("change-this-secret", 1000L * 60 * 60);

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, TwoFactorService twoFactorService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.twoFactorService = twoFactorService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        User user = new User(request.getName(), request.getEmail(), passwordEncoder.encode(request.getPassword()), request.getPhone());
        userRepository.save(user);
        Map<String, String> res = new HashMap<>();
        res.put("token", jwtUtil.generateToken(user.getEmail()));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String codeStr = body.get("code");
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        if (user.isTwoFactorEnabled()) {
            if (codeStr == null) {
                return ResponseEntity.status(401).body("Two-factor code required");
            }
            try {
                int code = Integer.parseInt(codeStr);
                if (!twoFactorService.verifyCode(user.getTwoFactorSecret(), code)) {
                    return ResponseEntity.status(401).body("Invalid two-factor code");
                }
            } catch (NumberFormatException e) {
                return ResponseEntity.status(400).body("Invalid code format");
            }
        }
        Map<String, String> res = new HashMap<>();
        res.put("token", jwtUtil.generateToken(user.getEmail()));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<?> enable2fa(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String email = extractEmailFromBearer(authHeader);
        User user = (email == null) ? null : userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");
        if (user.isTwoFactorEnabled()) return ResponseEntity.badRequest().body("2FA already enabled");
        String secret = twoFactorService.generateSecret();
        user.setTwoFactorSecret(secret);
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        Map<String, String> res = new HashMap<>();
        res.put("otpauth", twoFactorService.getOtpAuthUrl(user.getEmail(), secret));
        res.put("secret", secret);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disable2fa(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String email = extractEmailFromBearer(authHeader);
        User user = (email == null) ? null : userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
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


