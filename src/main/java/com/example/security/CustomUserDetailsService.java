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
        
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        // Add the old role if it exists
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        }
        
        // For now, skip the new roles system until tables are properly created
        // TODO: Re-enable when roles table is stable
        // if (user.getRoles() != null && !user.getRoles().isEmpty()) {
        //     authorities.addAll(user.getRoles().stream()
        //             .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
        //             .collect(Collectors.toList()));
        // }
        
        // If no roles found, add a default USER role
        if (authorities.isEmpty()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }
        
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
