package com.example.security;

import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        log.info("=== JWT FILTER PROCESSING ===");
        log.info("Request URI: {}", request.getRequestURI());
        log.info("Authorization header: {}", header != null ? "present" : "absent");
        
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            log.info("Token extracted (length: {})", token.length());
            
            try {
                String username = jwtUtil.extractUsername(token);
                log.info("Username extracted from token: {}", username);
                
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Create basic authentication with USER role
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            username, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    
                    log.info("✅ Authentication SUCCESSFULLY set for user: {} with authorities: {}", username, authorities);
                    log.info("Security context authentication: {}", SecurityContextHolder.getContext().getAuthentication());
                } else {
                    log.info("❌ Authentication NOT set - username: {}, existing auth: {}", 
                             username, SecurityContextHolder.getContext().getAuthentication() != null);
                    if (SecurityContextHolder.getContext().getAuthentication() != null) {
                        log.info("Existing auth details: {}", SecurityContextHolder.getContext().getAuthentication());
                    }
                }
            } catch (ExpiredJwtException e) {
                log.warn("❌ JWT token expired for request: {}", request.getRequestURI());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            } catch (Exception e) {
                log.error("❌ JWT token processing error for request: {}: {}", request.getRequestURI(), e.getMessage(), e);
                // Continue without authentication
            }
        } else {
            log.info("❌ No valid Authorization header found for request: {}", request.getRequestURI());
        }

        log.info("=== JWT FILTER COMPLETED ===");
        filterChain.doFilter(request, response);
    }
}


