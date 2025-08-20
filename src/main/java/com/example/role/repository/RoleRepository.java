package com.example.role.repository;

import com.example.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByName(String name);
    
    List<Role> findByIsActiveTrue();
    
    @Query("SELECT r FROM Role r WHERE r.name LIKE %:search% OR r.description LIKE %:search%")
    List<Role> searchRoles(@Param("search") String search);
    
    @Query("SELECT r FROM Role r JOIN r.users u WHERE u.id = :userId")
    Set<Role> findRolesByUserId(@Param("userId") Long userId);
    
    boolean existsByName(String name);
    
    boolean existsByNameAndIdNot(String name, Long id);
}
