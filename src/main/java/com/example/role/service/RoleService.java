package com.example.role.service;

import com.example.role.dto.CreateRoleRequest;
import com.example.role.dto.RoleDto;
import com.example.role.dto.UpdateRoleRequest;
import com.example.role.dto.AssignRoleRequest;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface RoleService {
    
    List<RoleDto> getAllRoles();
    
    Optional<RoleDto> getRoleById(Long id);
    
    RoleDto createRole(CreateRoleRequest request);
    
    RoleDto updateRole(Long id, UpdateRoleRequest request);
    
    void deleteRole(Long id);
    
    List<RoleDto> searchRoles(String search);
    
    Set<RoleDto> getRolesByUserId(Long userId);
    
    void assignRolesToUser(AssignRoleRequest request);
    
    void removeRolesFromUser(Long userId, Set<Long> roleIds);
    
    List<RoleDto> getActiveRoles();
}
