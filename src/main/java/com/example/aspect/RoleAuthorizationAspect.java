package com.example.aspect;

import com.example.annotation.RequireRole;
import com.example.user.entity.User;
import com.example.user.enums.UserRole;
import com.example.exception.InsufficientPrivilegesException;
import com.example.user.repository.UserRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class RoleAuthorizationAspect {

    @Autowired
    private UserRepository userRepository;

    @Before("@annotation(requireRole)")
    public void checkRole(JoinPoint joinPoint, RequireRole requireRole) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new InsufficientPrivilegesException("Authentication required");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InsufficientPrivilegesException("User not found"));

        UserRole[] requiredRoles = requireRole.value();
        boolean hasRequiredRole = false;

        for (UserRole role : requiredRoles) {
            if (user.getRole() == role) {
                hasRequiredRole = true;
                break;
            }
        }

        if (!hasRequiredRole) {
            throw new InsufficientPrivilegesException(
                "Insufficient privileges. Required roles: " + 
                java.util.Arrays.toString(requiredRoles) + 
                ", User role: " + user.getRole()
            );
        }
    }
}
