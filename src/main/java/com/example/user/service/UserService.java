package com.example.user.service;

import com.example.user.dto.CreateUserRequest;
import com.example.user.dto.UpdateUserRequest;
import com.example.user.dto.UserDto;
import com.example.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface UserService {
    
    UserDto createUser(CreateUserRequest request);
    
    UserDto updateUser(Long id, UpdateUserRequest request);
    
    void deleteUser(Long id);
    
    Optional<UserDto> getUserById(Long id);
    
    Optional<UserDto> getUserByEmail(String email);
    
    Page<UserDto> getAllUsers(Pageable pageable);
    
    Page<UserDto> searchUsers(String search, Pageable pageable);
    
    long getUserCount();
    
    long getUserCountByRole(String role);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhone(String phone);
    
    boolean existsByName(String name);
    
    User getCurrentUser();
    
    /**
     * Find or create user by OAuth2 provider information
     * @param email User's email
     * @param name User's name
     * @param oauth2Provider OAuth2 provider (e.g., "google", "github")
     * @param oauth2ProviderId Provider-specific user ID
     * @param profilePicture User's profile picture URL
     * @return User entity
     */
    User findOrCreateOAuth2User(String email, String name, String oauth2Provider, String oauth2ProviderId, String profilePicture);
}
