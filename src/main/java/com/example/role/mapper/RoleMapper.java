package com.example.role.mapper;

import com.example.role.dto.RoleDto;
import com.example.role.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    
    @Mapping(target = "userIds", expression = "java(role.getUsers().stream().map(user -> user.getId()).collect(java.util.stream.Collectors.toSet()))")
    @Mapping(target = "userCount", expression = "java(role.getUsers().size())")
    RoleDto toDto(Role role);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "users", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Role toEntity(com.example.role.dto.CreateRoleRequest createRoleRequest);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "users", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Role role, com.example.role.dto.UpdateRoleRequest updateRoleRequest);
    
    List<RoleDto> toDtoList(List<Role> roles);
}
