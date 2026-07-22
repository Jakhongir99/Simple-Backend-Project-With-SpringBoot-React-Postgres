package com.example.auth.service.impl;

import com.example.auth.dto.AuthResponse;
import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.exception.InvalidCredentialsException;
import com.example.security.JwtUtil;
import com.example.user.entity.User;
import com.example.user.enums.UserRole;
import com.example.user.mapper.UserMapper;
import com.example.user.repository.UserRepository;
import com.example.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserService userService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void login_success_returnsToken() {
        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("password123")
                .build();

        User user = User.builder()
                .id(1L)
                .email("user@example.com")
                .password("encoded")
                .role(UserRole.USER)
                .build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encoded")).thenReturn(true);
        when(jwtUtil.generateToken("user@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertEquals("jwt-token", response.getToken());
        assertEquals("user@example.com", response.getEmail());
        verify(jwtUtil).generateToken("user@example.com");
    }

    @Test
    void login_wrongPassword_throwsInvalidCredentials() {
        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("wrong")
                .build();

        User user = User.builder()
                .email("user@example.com")
                .password("encoded")
                .role(UserRole.USER)
                .build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
        verify(jwtUtil, never()).generateToken(anyString());
    }

    @Test
    void login_userNotFound_throwsInvalidCredentials() {
        LoginRequest request = LoginRequest.builder()
                .email("missing@example.com")
                .password("password123")
                .build();

        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void register_duplicateEmail_throwsInvalidCredentials() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Test User")
                .email("exists@example.com")
                .password("password123")
                .role(UserRole.USER)
                .build();

        when(userRepository.existsByEmail("exists@example.com")).thenReturn(true);

        assertThrows(InvalidCredentialsException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_success_returnsToken() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Test User")
                .email("new@example.com")
                .password("password123")
                .role(UserRole.USER)
                .build();

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(jwtUtil.generateToken("new@example.com")).thenReturn("new-token");

        AuthResponse response = authService.register(request);

        assertEquals("new-token", response.getToken());
        assertEquals("new@example.com", response.getEmail());
    }
}
