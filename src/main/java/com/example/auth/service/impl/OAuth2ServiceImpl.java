package com.example.auth.service.impl;

import com.example.auth.dto.AuthResponse;
import com.example.auth.dto.OAuth2UserInfo;
import com.example.auth.service.OAuth2Service;
import com.example.user.entity.User;
import com.example.user.enums.UserRole;
import com.example.user.service.UserService;
import com.example.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2ServiceImpl implements OAuth2Service {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String githubClientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String githubClientSecret;

    @Override
    public AuthResponse processGoogleOAuth2(String code) {
        try {
            // Exchange authorization code for access token
            String accessToken = exchangeGoogleCodeForToken(code);
            
            // Get user information from Google
            OAuth2UserInfo userInfo = getGoogleUserInfo(accessToken);
            userInfo.setProvider("google");
            
            // Find or create user
            User user = findOrCreateOAuth2User(userInfo);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());
            
            return AuthResponse.builder()
                    .token(token)
                    .email(user.getEmail())
                    .message("OAuth2 authentication successful")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error processing Google OAuth2: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process Google OAuth2 authentication", e);
        }
    }

    @Override
    public AuthResponse processGitHubOAuth2(String code) {
        try {
            // Exchange authorization code for access token
            String accessToken = exchangeGitHubCodeForToken(code);
            
            // Get user information from GitHub
            OAuth2UserInfo userInfo = getGitHubUserInfo(accessToken);
            userInfo.setProvider("github");
            
            // Find or create user
            User user = findOrCreateOAuth2User(userInfo);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());
            
            return AuthResponse.builder()
                    .token(token)
                    .email(user.getEmail())
                    .message("OAuth2 authentication successful")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error processing GitHub OAuth2: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process GitHub OAuth2 authentication", e);
        }
    }

    @Override
    public OAuth2UserInfo getGoogleUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                HttpMethod.GET,
                entity,
                Map.class
            );
            
            Map<String, Object> userInfo = response.getBody();
            
            return OAuth2UserInfo.builder()
                    .id((String) userInfo.get("sub"))
                    .email((String) userInfo.get("email"))
                    .name((String) userInfo.get("name"))
                    .picture((String) userInfo.get("picture"))
                    .emailVerified((Boolean) userInfo.get("email_verified"))
                    .build();
                    
        } catch (Exception e) {
            log.error("Error getting Google user info: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get Google user information", e);
        }
    }

    @Override
    public OAuth2UserInfo getGitHubUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("Accept", "application/vnd.github.v3+json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.github.com/user",
                HttpMethod.GET,
                entity,
                Map.class
            );
            
            Map<String, Object> userInfo = response.getBody();
            
            // Get email from GitHub (requires additional API call)
            String email = getGitHubEmail(accessToken);
            
            return OAuth2UserInfo.builder()
                    .id(String.valueOf(userInfo.get("id")))
                    .email(email)
                    .name((String) userInfo.get("name"))
                    .picture((String) userInfo.get("avatar_url"))
                    .emailVerified(true) // GitHub emails are verified
                    .build();
                    
        } catch (Exception e) {
            log.error("Error getting GitHub user info: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get GitHub user information", e);
        }
    }

    private String exchangeGoogleCodeForToken(String code) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", googleClientId);
        params.add("client_secret", googleClientSecret);
        params.add("code", code);
        params.add("grant_type", "authorization_code");
        params.add("redirect_uri", "http://localhost:8080/api/auth/oauth2/google/callback");
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            "https://oauth2.googleapis.com/token",
            HttpMethod.POST,
            entity,
            Map.class
        );
        
        Map<String, Object> tokenResponse = response.getBody();
        return (String) tokenResponse.get("access_token");
    }

    private String exchangeGitHubCodeForToken(String code) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", githubClientId);
        params.add("client_secret", githubClientSecret);
        params.add("code", code);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/json");
        
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            "https://github.com/login/oauth/access_token",
            HttpMethod.POST,
            entity,
            Map.class
        );
        
        Map<String, Object> tokenResponse = response.getBody();
        return (String) tokenResponse.get("access_token");
    }

    private String getGitHubEmail(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("Accept", "application/vnd.github.v3+json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map[]> response = restTemplate.exchange(
                "https://api.github.com/user/emails",
                HttpMethod.GET,
                entity,
                Map[].class
            );
            
            Map<String, Object>[] emails = response.getBody();
            if (emails != null && emails.length > 0) {
                // Return the primary email
                for (Map<String, Object> email : emails) {
                    if ((Boolean) email.get("primary")) {
                        return (String) email.get("email");
                    }
                }
                // If no primary email found, return the first one
                return (String) emails[0].get("email");
            }
            
            return null;
        } catch (Exception e) {
            log.error("Error getting GitHub email: {}", e.getMessage(), e);
            return null;
        }
    }

    private User findOrCreateOAuth2User(OAuth2UserInfo userInfo) {
        // Handle case where name might be null
        String name = userInfo.getName();
        if (name == null || name.trim().isEmpty()) {
            // Extract name from email if not provided
            String email = userInfo.getEmail();
            if (email != null && email.contains("@")) {
                name = email.split("@")[0];
            } else {
                name = "User"; // Fallback name
            }
        }
        
        return userService.findOrCreateOAuth2User(
            userInfo.getEmail(),
            name,
            userInfo.getProvider(),
            userInfo.getProviderId(),
            userInfo.getPicture()
        );
    }
}
