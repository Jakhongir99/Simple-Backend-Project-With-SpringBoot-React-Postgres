package com.example.service;

import com.example.entity.User;
import com.example.repository.UserRepository;
import com.example.exception.PasswordValidationException;
import com.example.exception.UserNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.util.StringUtils;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByNameFilter(String nameFilter) {
        if (!StringUtils.hasText(nameFilter)) {
            return userRepository.findAll();
        }
        return userRepository.findByNameContainingIgnoreCase(nameFilter.trim());
    }

    public Page<User> getUsersPage(String nameFilter, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        if (StringUtils.hasText(nameFilter)) {
            return userRepository.findByNameContainingIgnoreCase(nameFilter.trim(), pageable);
        }
        return userRepository.findAll(pageable);
    }

    public Page<User> searchUsers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        String q = (query == null) ? "" : query.trim();
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, pageable);
    }

    public Page<User> getUsersCreatedBetween(LocalDateTime from, LocalDateTime to, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        return userRepository.findByCreatedAtBetween(from, to, pageable);
    }

    public List<Object[]> getEmailDomainStats() {
        return userRepository.countByEmailDomain();
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User with email " + user.getEmail() + " already exists");
        }
        validatePassword(user.getPassword());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        validatePassword(userDetails.getPassword());
        user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        user.setPhone(userDetails.getPhone());
        
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }
    
    public boolean userExists(Long id) {
        return userRepository.existsById(id);
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
        
        // Check for common weak passwords
        String[] weakPasswords = {"password", "123456", "qwerty", "admin", "user", "test"};
        for (String weakPassword : weakPasswords) {
            if (password.toLowerCase().equals(weakPassword)) {
                throw new PasswordValidationException("Password is too weak. Please choose a stronger password");
            }
        }
        
        // Check if password contains at least one letter and one number
        boolean hasLetter = password.matches(".*[a-zA-Z].*");
        boolean hasNumber = password.matches(".*\\d.*");
        
        if (!hasLetter || !hasNumber) {
            throw new PasswordValidationException("Password must contain at least one letter and one number");
        }
    }

    public long getUserCount() {
        return userRepository.count();
    }
} 