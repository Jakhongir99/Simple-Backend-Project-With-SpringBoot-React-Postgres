package com.example.security;

import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        String requestURI = request.getRequestURI();
        
        // Skip JWT processing only for truly public endpoints
        if (isPublicEndpoint(requestURI)) {
            log.info("=== JWT FILTER SKIPPED for public endpoint: {} ===", requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        log.info("=== JWT FILTER PROCESSING ===");
        log.info("Request URI: {}", requestURI);
        log.info("Authorization header: {}", header != null ? "present" : "absent");
        
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            log.info("Token extracted (length: {})", token.length());
            
            try {
                String username = jwtUtil.extractUsername(token);
                log.info("Username extracted from token: {}", username);
                
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Load user details from database
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    
                    // Create authentication token with user details
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    
                    log.info("✅ Authentication SUCCESSFULLY set for user: {} with authorities: {}", 
                             username, userDetails.getAuthorities());
                    log.info("Security context authentication: {}", SecurityContextHolder.getContext().getAuthentication());
                    log.info("User role: {}", userDetails.getAuthorities().stream()
                            .map(authority -> authority.getAuthority())
                            .findFirst()
                            .orElse("NO_ROLE"));
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
    
    private boolean isPublicEndpoint(String requestURI) {
        // Public endpoints that don't need JWT authentication
        return requestURI.startsWith("/api/auth/login") ||
               requestURI.startsWith("/api/auth/register") ||
               requestURI.startsWith("/api/auth/logout") ||
               requestURI.startsWith("/api/auth/debug-token") ||
               requestURI.startsWith("/api/auth/oauth2/") ||
               requestURI.startsWith("/swagger-ui/") ||
               requestURI.startsWith("/v2/api-docs") ||
               requestURI.startsWith("/v3/api-docs");
    }
}


