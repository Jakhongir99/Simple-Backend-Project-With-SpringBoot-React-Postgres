package com.example.auth.service;

import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.dto.AuthResponse;
import com.example.user.dto.UserDto;

public interface AuthService {
    
    AuthResponse register(RegisterRequest request);
    
    AuthResponse login(LoginRequest request);
    
    AuthResponse createAdmin(RegisterRequest request);
    
    UserDto getCurrentUser();
    
    void logout();
}
