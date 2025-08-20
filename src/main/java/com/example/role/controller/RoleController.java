package com.example.role.controller;

import com.example.role.dto.CreateRoleRequest;
import com.example.role.dto.RoleDto;
import com.example.role.dto.UpdateRoleRequest;
import com.example.role.dto.AssignRoleRequest;
import com.example.role.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<RoleDto>> getAllRoles() {
        try {
            List<RoleDto> roles = roleService.getAllRoles();
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            log.error("Error fetching all roles: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RoleDto> getRoleById(@PathVariable Long id) {
        try {
            return roleService.getRoleById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching role by ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RoleDto> createRole(@Valid @RequestBody CreateRoleRequest request) {
        try {
            RoleDto createdRole = roleService.createRole(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating role: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating role: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RoleDto> updateRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
        try {
            RoleDto updatedRole = roleService.updateRole(id, request);
            return ResponseEntity.ok(updatedRole);
        } catch (IllegalArgumentException e) {
            log.error("Validation error updating role: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error updating role with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        try {
            roleService.deleteRole(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            log.error("Cannot delete role: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error deleting role with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<RoleDto>> searchRoles(@RequestParam String q) {
        try {
            List<RoleDto> roles = roleService.searchRoles(q);
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            log.error("Error searching roles: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or #userId == authentication.principal.id")
    public ResponseEntity<Set<RoleDto>> getRolesByUserId(@PathVariable Long userId) {
        try {
            Set<RoleDto> roles = roleService.getRolesByUserId(userId);
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            log.error("Error fetching roles for user ID {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> assignRolesToUser(@Valid @RequestBody AssignRoleRequest request) {
        try {
            roleService.assignRolesToUser(request);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("Validation error assigning roles: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error assigning roles to user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> removeRolesFromUser(@PathVariable Long userId, @RequestBody Set<Long> roleIds) {
        try {
            roleService.removeRolesFromUser(userId, roleIds);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error removing roles from user ID {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<RoleDto>> getActiveRoles() {
        try {
            List<RoleDto> roles = roleService.getActiveRoles();
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            log.error("Error fetching active roles: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
