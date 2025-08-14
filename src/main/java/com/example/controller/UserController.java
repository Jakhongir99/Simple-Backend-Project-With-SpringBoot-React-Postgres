package com.example.controller;

import com.example.dto.UserMapper;
import com.example.dto.UserRequestDTO;
import com.example.dto.UserResponseDTO;
import com.example.entity.User;
import com.example.entity.UserRole;
import com.example.service.UserService;
import com.example.annotation.RequireRole;
import com.example.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import javax.validation.Valid;
import org.springframework.data.domain.Page;
import java.util.Optional;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Api(tags = "User Management", description = "CRUD operations for user management")
public class UserController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/me")
    @ApiOperation(value = "Get current user info", notes = "Retrieve the current authenticated user's information")
    public ResponseEntity<UserResponseDTO> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            Optional<User> user = userService.getUserByEmail(email);
            
            return user.map(u -> ResponseEntity.ok(userMapper.toResponse(u)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
    
    @GetMapping
    @ApiOperation(value = "Get all users", notes = "Retrieve paginated list of users with optional name filtering")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        Page<UserResponseDTO> users = userService.getUsersPage(name, page, size)
                .map(userMapper::toResponse);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserResponseDTO>> search(
            @RequestParam("q") String q,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        Page<UserResponseDTO> users = userService.searchUsers(q, page, size)
                .map(userMapper::toResponse);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/created-between")
    public ResponseEntity<Page<UserResponseDTO>> createdBetween(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        Page<UserResponseDTO> users = userService.getUsersCreatedBetween(from, to, page, size)
                .map(userMapper::toResponse);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/email-domain-stats")
    public ResponseEntity<List<?>> emailDomainStats() {
        return ResponseEntity.ok(userService.getEmailDomainStats());
    }
    
    @GetMapping("/{id}")
    @ApiOperation(value = "Get user by ID", notes = "Retrieve a specific user by their ID")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(u -> ResponseEntity.ok(userMapper.toResponse(u)))
                .orElseThrow(() -> new com.example.exception.UserNotFoundException("User not found with id: " + id));
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        return user.map(u -> ResponseEntity.ok(userMapper.toResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @ApiOperation(value = "Create new user", notes = "Create a new user account")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRequestDTO request) {
        User createdUser = userService.createUser(userMapper.toEntity(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toResponse(createdUser));
    }
    
    @PutMapping("/{id}")
    @RequireRole({UserRole.ADMIN})
    @ApiOperation(value = "Update user", notes = "Update an existing user's information (Admin only)")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserRequestDTO userDetails) {
        User updatedUser = userService.updateUser(id, userMapper.toEntity(userDetails));
        return ResponseEntity.ok(userMapper.toResponse(updatedUser));
    }
    
    @DeleteMapping("/{id}")
    @RequireRole({UserRole.ADMIN})
    @ApiOperation(value = "Delete user", notes = "Delete a user by their ID (Admin only)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("PostgreSQL CRUD API is running!");
    }
    
    @PutMapping("/{id}/promote-to-admin")
    @RequireRole({UserRole.ADMIN})
    @ApiOperation(value = "Promote user to admin", notes = "Promote a user to admin role (Admin only)")
    public ResponseEntity<UserResponseDTO> promoteToAdmin(@PathVariable Long id) {
        User promotedUser = userService.promoteToAdmin(id);
        return ResponseEntity.ok(userMapper.toResponse(promotedUser));
    }
} 