package com.example.auth.service;

import com.example.auth.dto.AuthResponse;
import com.example.auth.dto.OAuth2UserInfo;

public interface OAuth2Service {
    
    /**
     * Process OAuth2 authentication for Google
     * @param code Authorization code from Google
     * @return AuthResponse with JWT token
     */
    AuthResponse processGoogleOAuth2(String code);
    
    /**
     * Process OAuth2 authentication for GitHub
     * @param code Authorization code from GitHub
     * @return AuthResponse with JWT token
     */
    AuthResponse processGitHubOAuth2(String code);
    
    /**
     * Get OAuth2 user information from Google
     * @param accessToken Access token from Google
     * @return OAuth2UserInfo object
     */
    OAuth2UserInfo getGoogleUserInfo(String accessToken);
    
    /**
     * Get OAuth2 user information from GitHub
     * @param accessToken Access token from GitHub
     * @return OAuth2UserInfo object
     */
    OAuth2UserInfo getGitHubUserInfo(String accessToken);
}
