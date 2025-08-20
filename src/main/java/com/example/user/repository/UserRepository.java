package com.example.user.repository;

import com.example.user.entity.User;
import com.example.user.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByPhone(String phone);
    
    Optional<User> findByName(String name);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhone(String phone);
    
    boolean existsByName(String name);
    
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.id != :excludeId")
    Optional<User> findByEmailExcludingId(@Param("email") String email, @Param("excludeId") Long excludeId);
    
    @Query("SELECT u FROM User u WHERE u.phone = :phone AND u.id != :excludeId")
    Optional<User> findByPhoneExcludingId(@Param("phone") String phone, @Param("excludeId") Long excludeId);
    
    @Query("SELECT u FROM User u WHERE u.name = :name AND u.id != :excludeId")
    Optional<User> findByNameExcludingId(@Param("name") String name, @Param("excludeId") Long excludeId);
    
    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR u.name LIKE %:search% OR u.email LIKE %:search% OR u.phone LIKE %:search%)")
    Page<User> findBySearchCriteria(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT COUNT(u) FROM User u WHERE " +
           "(:search IS NULL OR u.name LIKE %:search% OR u.email LIKE %:search% OR u.phone LIKE %:search%)")
    long countBySearchCriteria(@Param("search") String search);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") String role);
    
    Optional<User> findByRole(UserRole role);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    Optional<User> findByEmailWithRoles(@Param("email") String email);
}
