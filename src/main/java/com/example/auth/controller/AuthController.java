package com.example.auth.controller;

import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.dto.AuthResponse;
import com.example.auth.service.AuthService;
import com.example.auth.service.OAuth2Service;
import com.example.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final OAuth2Service oAuth2Service;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String githubClientId;

    @Value("${server.port:8080}")
    private int serverPort;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        try {
            authService.logout();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error during logout: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/create-admin")
    public ResponseEntity<AuthResponse> createFirstAdmin(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.createAdmin(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        try {
            UserDto currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(currentUser);
        } catch (Exception e) {
            log.error("Error getting current user: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/debug-token")
    public ResponseEntity<Map<String, Object>> debugToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> response = new HashMap<>();
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("status", "no_token");
            response.put("message", "No Authorization header or invalid format");
            return ResponseEntity.ok(response);
        }
        response.put("status", "token_present");
        response.put("message", "Token header received");
        response.put("tokenLength", authHeader.length());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/oauth2/google/callback")
    public ResponseEntity<Void> googleOAuth2Callback(@RequestParam("code") String code) {
        try {
            log.info("Google OAuth2 callback received");
            AuthResponse response = oAuth2Service.processGoogleOAuth2(code);
            String redirectUrl = "http://localhost:3000/oauth-callback?"
                    + "token=" + response.getToken()
                    + "&email=" + response.getEmail()
                    + "&message=" + response.getMessage()
                    + "&success=true";
            return ResponseEntity.status(302).header("Location", redirectUrl).build();
        } catch (Exception e) {
            log.error("Error processing Google OAuth2 callback: {}", e.getMessage(), e);
            String errorRedirectUrl = "http://localhost:3000/oauth-callback?"
                    + "success=false"
                    + "&message=Failed to process Google OAuth2 authentication";
            return ResponseEntity.status(302).header("Location", errorRedirectUrl).build();
        }
    }

    @GetMapping("/oauth2/github/callback")
    public ResponseEntity<Void> githubOAuth2Callback(@RequestParam("code") String code) {
        try {
            log.info("GitHub OAuth2 callback received");
            AuthResponse response = oAuth2Service.processGitHubOAuth2(code);
            String redirectUrl = "http://localhost:3000/oauth-callback?"
                    + "token=" + response.getToken()
                    + "&email=" + response.getEmail()
                    + "&message=" + response.getMessage()
                    + "&success=true";
            return ResponseEntity.status(302).header("Location", redirectUrl).build();
        } catch (Exception e) {
            log.error("Error processing GitHub OAuth2 callback: {}", e.getMessage(), e);
            String errorRedirectUrl = "http://localhost:3000/oauth-callback?"
                    + "success=false"
                    + "&message=Failed to process GitHub OAuth2 authentication";
            return ResponseEntity.status(302).header("Location", errorRedirectUrl).build();
        }
    }

    @GetMapping("/oauth2/google/authorize")
    public ResponseEntity<Map<String, String>> googleOAuth2Authorize() {
        if (isPlaceholder(googleClientId)) {
            return oauthMisconfigured("Google");
        }

        String googleAuthUrl = UriComponentsBuilder
                .fromHttpUrl("https://accounts.google.com/o/oauth2/auth")
                .queryParam("client_id", googleClientId)
                .queryParam("redirect_uri", "http://localhost:" + serverPort + "/api/auth/oauth2/google/callback")
                .queryParam("scope", "openid email profile")
                .queryParam("response_type", "code")
                .build()
                .toUriString();

        Map<String, String> response = new HashMap<>();
        response.put("authorizationUrl", googleAuthUrl);
        response.put("message", "Redirect user to this URL for Google OAuth2 authentication");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/oauth2/github/authorize")
    public ResponseEntity<Map<String, String>> githubOAuth2Authorize() {
        if (isPlaceholder(githubClientId)) {
            return oauthMisconfigured("GitHub");
        }

        String githubAuthUrl = UriComponentsBuilder
                .fromHttpUrl("https://github.com/login/oauth/authorize")
                .queryParam("client_id", githubClientId)
                .queryParam("redirect_uri", "http://localhost:" + serverPort + "/api/auth/oauth2/github/callback")
                .queryParam("scope", "read:user user:email")
                .build()
                .toUriString();

        Map<String, String> response = new HashMap<>();
        response.put("authorizationUrl", githubAuthUrl);
        response.put("message", "Redirect user to this URL for GitHub OAuth2 authentication");
        return ResponseEntity.ok(response);
    }

    private boolean isPlaceholder(String clientId) {
        return clientId == null
                || clientId.trim().isEmpty()
                || clientId.startsWith("your-");
    }

    private ResponseEntity<Map<String, String>> oauthMisconfigured(String provider) {
        Map<String, String> response = new HashMap<>();
        response.put("authorizationUrl", "");
        response.put("message", provider
                + " OAuth is not configured. Put real client-id/secret into "
                + "src/main/resources/application-local.properties");
        return ResponseEntity.status(503).body(response);
    }
}
