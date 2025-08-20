package com.example.role.service.impl;

import com.example.role.dto.CreateRoleRequest;
import com.example.role.dto.RoleDto;
import com.example.role.dto.UpdateRoleRequest;
import com.example.role.dto.AssignRoleRequest;
import com.example.role.entity.Role;
import com.example.role.mapper.RoleMapper;
import com.example.role.repository.RoleRepository;
import com.example.role.service.RoleService;
import com.example.user.entity.User;
import com.example.user.repository.UserRepository;
import com.example.user.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final RoleMapper roleMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        log.info("Fetching all roles");
        List<Role> roles = roleRepository.findAll();
        return roleMapper.toDtoList(roles);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RoleDto> getRoleById(Long id) {
        log.info("Fetching role by ID: {}", id);
        return roleRepository.findById(id)
                .map(roleMapper::toDto);
    }

    @Override
    public RoleDto createRole(CreateRoleRequest request) {
        log.info("Creating new role: {}", request.getName());
        
        if (roleRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Role with name '" + request.getName() + "' already exists");
        }
        
        Role role = roleMapper.toEntity(request);
        Role savedRole = roleRepository.save(role);
        log.info("Role created successfully with ID: {}", savedRole.getId());
        
        return roleMapper.toDto(savedRole);
    }

    @Override
    public RoleDto updateRole(Long id, UpdateRoleRequest request) {
        log.info("Updating role with ID: {}", id);
        
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with ID: " + id));
        
        if (request.getName() != null && !request.getName().equals(role.getName())) {
            if (roleRepository.existsByNameAndIdNot(request.getName(), id)) {
                throw new IllegalArgumentException("Role with name '" + request.getName() + "' already exists");
            }
        }
        
        roleMapper.updateEntity(role, request);
        Role updatedRole = roleRepository.save(role);
        log.info("Role updated successfully with ID: {}", updatedRole.getId());
        
        return roleMapper.toDto(updatedRole);
    }

    @Override
    public void deleteRole(Long id) {
        log.info("Deleting role with ID: {}", id);
        
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with ID: " + id));
        
        if (!role.getUsers().isEmpty()) {
            throw new IllegalStateException("Cannot delete role that is assigned to users. Remove role assignments first.");
        }
        
        roleRepository.delete(role);
        log.info("Role deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> searchRoles(String search) {
        log.info("Searching roles with term: {}", search);
        List<Role> roles = roleRepository.searchRoles(search);
        return roleMapper.toDtoList(roles);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<RoleDto> getRolesByUserId(Long userId) {
        log.info("Fetching roles for user ID: {}", userId);
        Set<Role> roles = roleRepository.findRolesByUserId(userId);
        return roles.stream()
                .map(roleMapper::toDto)
                .collect(Collectors.toSet());
    }

    @Override
    public void assignRolesToUser(AssignRoleRequest request) {
        log.info("Assigning roles to user ID: {}", request.getUserId());
        
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + request.getUserId()));
        
        Set<Role> roles = roleRepository.findAllById(request.getRoleIds())
                .stream()
                .collect(Collectors.toSet());
        
        if (roles.size() != request.getRoleIds().size()) {
            throw new IllegalArgumentException("Some role IDs were not found");
        }
        
        user.getRoles().addAll(roles);
        userRepository.save(user);
        log.info("Roles assigned successfully to user ID: {}", request.getUserId());
    }

    @Override
    public void removeRolesFromUser(Long userId, Set<Long> roleIds) {
        log.info("Removing roles from user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        
        user.getRoles().removeIf(role -> roleIds.contains(role.getId()));
        userRepository.save(user);
        log.info("Roles removed successfully from user ID: {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getActiveRoles() {
        log.info("Fetching active roles");
        List<Role> roles = roleRepository.findByIsActiveTrue();
        return roleMapper.toDtoList(roles);
    }
}
