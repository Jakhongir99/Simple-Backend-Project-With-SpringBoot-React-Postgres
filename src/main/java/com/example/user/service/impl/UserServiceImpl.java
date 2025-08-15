package com.example.user.service.impl;

import com.example.user.dto.CreateUserRequest;
import com.example.user.dto.UpdateUserRequest;
import com.example.user.dto.UserDto;
import com.example.user.entity.User;
import com.example.user.enums.UserRole;
import com.example.user.exception.PasswordValidationException;
import com.example.user.exception.UserNotFoundException;
import com.example.user.exception.UserValidationException;
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
        
        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        
        return mapToDto(savedUser);
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
        
        // Update fields
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getPassword() != null) {
            validatePassword(request.getPassword());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        
        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with ID: {}", updatedUser.getId());
        
        return mapToDto(updatedUser);
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
        return userRepository.findById(id).map(this::mapToDto);
    }

    @Override
    public Optional<UserDto> getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::mapToDto);
    }

    @Override
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToDto);
    }

    @Override
    public Page<UserDto> searchUsers(String search, Pageable pageable) {
        return userRepository.findBySearchCriteria(search, pageable).map(this::mapToDto);
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
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("Current user not found"));
        }
        
        throw new UserNotFoundException("Current user not found");
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
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
}
