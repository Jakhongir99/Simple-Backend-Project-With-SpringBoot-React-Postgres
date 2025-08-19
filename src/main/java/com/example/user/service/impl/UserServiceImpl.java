package com.example.user.service.impl;

import com.example.user.dto.CreateUserRequest;
import com.example.user.dto.UpdateUserRequest;
import com.example.user.dto.UserDto;
import com.example.user.entity.User;
import com.example.user.enums.UserRole;
import com.example.user.exception.PasswordValidationException;
import com.example.user.exception.UserNotFoundException;
import com.example.user.exception.UserValidationException;
import com.example.user.mapper.UserMapper;
import com.example.user.repository.UserRepository;
import com.example.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public UserDto createUser(CreateUserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());
        
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserValidationException("User with email " + request.getEmail() + " already exists");
        }
        
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new UserValidationException("User with phone " + request.getPhone() + " already exists");
        }
        
        if (userRepository.existsByName(request.getName())) {
            throw new UserValidationException("User with name " + request.getName() + " already exists");
        }
        
        // Validate password
        validatePassword(request.getPassword());
        
        // Create user using mapper
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        
        return userMapper.toDto(savedUser);
    }

    @Override
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        log.info("Updating user with ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        
        // Check for conflicts with other users
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new UserValidationException("User with email " + request.getEmail() + " already exists");
            }
        }
        
        if (request.getPhone() != null && !request.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new UserValidationException("User with phone " + request.getPhone() + " already exists");
            }
        }
        
        if (request.getName() != null && !request.getName().equals(user.getName())) {
            if (userRepository.existsByName(request.getName())) {
                throw new UserValidationException("User with name " + request.getName() + " already exists");
            }
        }
        
        // Update user using mapper
        userMapper.updateEntity(user, request);
        
        // Update password if provided
        if (request.getPassword() != null) {
            validatePassword(request.getPassword());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with ID: {}", updatedUser.getId());
        
        return userMapper.toDto(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);
        
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found with ID: " + id);
        }
        
        userRepository.deleteById(id);
        log.info("User deleted successfully with ID: {}", id);
    }

    @Override
    public Optional<UserDto> getUserById(Long id) {
        return userRepository.findById(id).map(userMapper::toDto);
    }

    @Override
    public Optional<UserDto> getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(userMapper::toDto);
    }

    @Override
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toDto);
    }

    @Override
    public Page<UserDto> searchUsers(String search, Pageable pageable) {
        return userRepository.findBySearchCriteria(search, pageable).map(userMapper::toDto);
    }

    @Override
    public long getUserCount() {
        return userRepository.count();
    }

    @Override
    public long getUserCountByRole(String role) {
        return userRepository.countByRole(role);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }

    @Override
    public boolean existsByName(String name) {
        return userRepository.existsByName(name);
    }

    @Override
    public User getCurrentUser() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            log.info("Current principal type: {}", principal.getClass().getSimpleName());
            log.info("Current principal: {}", principal);
            
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
                log.info("Extracted email from UserDetails: {}", email);
                return userRepository.findByEmail(email)
                        .orElseThrow(() -> new UserNotFoundException("Current user not found with email: " + email));
            } else if (principal instanceof String) {
                String email = (String) principal;
                log.info("Extracted email from String principal: {}", email);
                return userRepository.findByEmail(email)
                        .orElseThrow(() -> new UserNotFoundException("Current user not found with email: " + email));
            }
            
            log.error("Unexpected principal type: {}", principal.getClass().getName());
            throw new UserNotFoundException("Current user not found - unexpected principal type");
        } catch (Exception e) {
            log.error("Error getting current user: {}", e.getMessage(), e);
            throw new UserNotFoundException("Error getting current user: " + e.getMessage());
        }
    }



    private void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new PasswordValidationException("Password cannot be empty");
        }
        if (password.length() < 6) {
            throw new PasswordValidationException("Password must be at least 6 characters long");
        }
        if (password.length() > 100) {
            throw new PasswordValidationException("Password cannot exceed 100 characters");
        }
        
        String[] weakPasswords = {"password", "123456", "qwerty", "admin", "user", "test"};
        for (String weakPassword : weakPasswords) {
            if (password.toLowerCase().equals(weakPassword)) {
                throw new PasswordValidationException("Password is too weak. Please choose a stronger password");
            }
        }
        
        boolean hasLetter = password.matches(".*[a-zA-Z].*");
        boolean hasNumber = password.matches(".*\\d.*");
        if (!hasLetter || !hasNumber) {
            throw new PasswordValidationException("Password must contain at least one letter and one number");
        }
    }

    @Override
    public User findOrCreateOAuth2User(String email, String name, String oauth2Provider, String oauth2ProviderId, String profilePicture) {
        log.info("Finding or creating OAuth2 user with email: {}, provider: {}", email, oauth2Provider);
        
        // Try to find existing user by email
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            log.info("Found existing user with email: {}, updating OAuth2 information", email);
            
            // Update OAuth2 provider information
            user.setOauth2Provider(oauth2Provider);
            user.setOauth2ProviderId(oauth2ProviderId);
            user.setProfilePicture(profilePicture);
            user.setEmailVerified(true); // OAuth2 users have verified emails
            
            // Save and return updated user
            User savedUser = userRepository.save(user);
            log.info("Updated existing user with OAuth2 information, ID: {}", savedUser.getId());
            return savedUser;
        }
        
        // Create new OAuth2 user
        log.info("Creating new OAuth2 user with email: {}, provider: {}", email, oauth2Provider);
        User newUser = User.builder()
                .email(email)
                .name(name != null ? name : email.split("@")[0]) // Use email prefix if name is null
                .phone("") // OAuth2 users don't have phone initially
                .password("") // OAuth2 users don't have passwords
                .role(UserRole.USER) // Default role for OAuth2 users
                .oauth2Provider(oauth2Provider)
                .oauth2ProviderId(oauth2ProviderId)
                .profilePicture(profilePicture)
                .emailVerified(true) // OAuth2 users have verified emails
                .build();
        
        User savedUser = userRepository.save(newUser);
        log.info("Created new OAuth2 user with ID: {}", savedUser.getId());
        return savedUser;
    }
}
