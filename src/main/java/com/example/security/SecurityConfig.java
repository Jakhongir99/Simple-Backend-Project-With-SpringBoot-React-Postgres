package com.example.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Slf4j
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        log.info("Configuring security filter chain with JWT filter: {}", jwtAuthenticationFilter.getClass().getSimpleName());
        
        http
            .csrf().disable()
            .cors().and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .antMatchers("/api/auth/login", "/api/auth/register").permitAll()
                .antMatchers("/api/auth/logout").permitAll()
                .antMatchers("/api/auth/debug-token").permitAll()
                .antMatchers("/api/auth/oauth2/**").permitAll()
                .antMatchers("/api/auth/me").authenticated()
                .antMatchers(HttpMethod.GET, "/api/users/**").authenticated()
                // Translation endpoints - allow public access for all operations
                .antMatchers("/api/translations/**").permitAll()
                .antMatchers("/api/translations/debug/**").permitAll() // Debug endpoint
                .antMatchers("/api/translations/test").permitAll() // Test endpoint
                // File endpoints - allow public access for viewing files
                .antMatchers(HttpMethod.GET, "/api/files/public/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/files/all/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/files/search").permitAll()
                .antMatchers(HttpMethod.GET, "/api/files/type/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/files/recent").permitAll()
                // Swagger UI endpoints
                .antMatchers("/swagger-ui/**", "/swagger-ui.html", "/v2/api-docs", "/swagger-resources/**", "/webjars/**", "/v3/api-docs/**").permitAll()
                // Static resources and error pages
                .antMatchers("/", "/error", "/favicon.ico").permitAll()
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        log.info("JWT filter added to security chain: {}", jwtAuthenticationFilter.getClass().getSimpleName());

        log.info("Security filter chain configured successfully");
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "X-Requested-With", "Accept", 
            "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(Arrays.asList("Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}


