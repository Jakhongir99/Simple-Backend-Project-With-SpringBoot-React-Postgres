package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2UserInfo {
    
    private String id;
    private String email;
    private String name;
    private String picture;
    private String provider; // "google" or "github"
    private String providerId; // ID from the OAuth2 provider
    private boolean emailVerified;
}
