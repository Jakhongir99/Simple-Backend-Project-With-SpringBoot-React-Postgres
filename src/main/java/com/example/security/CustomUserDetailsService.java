package com.example.security;

import com.example.user.entity.User;
import com.example.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("Loading user details for email: {}", email);
        
        // For now, use basic user lookup to avoid JOIN FETCH issues during startup
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        log.info("User found: {} with role: {}", user.getEmail(), user.getRole());
        
        // Use a Set to avoid duplicate authorities (enum role + dynamic role with same name)
        java.util.Set<SimpleGrantedAuthority> authoritySet = new java.util.LinkedHashSet<>();

        // 1) Primary enum role (e.g. ROLE_USER / ROLE_ADMIN)
        if (user.getRole() != null) {
            authoritySet.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        }

        // 2) Dynamic roles from the roles table (EAGER-fetched on the User entity).
        //    A user assigned the "HR" role gets ROLE_HR, etc. This makes @PreAuthorize
        //    checks like hasRole('HR') work for assigned dynamic roles.
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            user.getRoles().stream()
                    .filter(role -> role.getName() != null
                            && (role.getIsActive() == null || role.getIsActive()))
                    .forEach(role -> authoritySet.add(
                            new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase())));
        }

        // 3) Fallback default
        if (authoritySet.isEmpty()) {
            authoritySet.add(new SimpleGrantedAuthority("ROLE_USER"));
        }

        List<SimpleGrantedAuthority> authorities = new ArrayList<>(authoritySet);
        
        log.info("User authorities: {}", authorities);
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
