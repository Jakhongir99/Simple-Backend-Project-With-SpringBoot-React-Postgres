package com.example.repository;

import com.example.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    List<User> findByNameContainingIgnoreCase(String name);

    Page<User> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);

    Page<User> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);

    List<User> findByTwoFactorEnabled(Boolean twoFactorEnabled);

    @Query("SELECT LOWER(SUBSTRING(u.email, LOCATE('@', u.email)+1)) AS domain, COUNT(u) AS cnt " +
           "FROM User u " +
           "WHERE LOCATE('@', u.email) > 0 " +
           "GROUP BY LOWER(SUBSTRING(u.email, LOCATE('@', u.email)+1))")
    List<Object[]> countByEmailDomain();
} 