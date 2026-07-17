package com.example.service;

import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.Collection;

@Service
public class CacheManagementService {

    private final CacheManager cacheManager;

    public CacheManagementService(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    /**
     * Clear all caches
     */
    public void clearAllCaches() {
        Collection<String> cacheNames = cacheManager.getCacheNames();
        cacheNames.forEach(cacheName -> {
            org.springframework.cache.Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
            }
        });
    }

    /**
     * Clear a specific cache by name
     */
    public void clearCache(String cacheName) {
        org.springframework.cache.Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        }
    }

    /**
     * Get all cache names
     */
    public Collection<String> getCacheNames() {
        return cacheManager.getCacheNames();
    }

    /**
     * Clear user-related caches
     */
    public void clearUserCaches() {
        clearCache("users");
        clearCache("userCounts");
        clearCache("userExists");
        clearCache("currentUser");
    }

    /**
     * Clear role-related caches
     */
    public void clearRoleCaches() {
        clearCache("roles");
        clearCache("roleStats");
        clearCache("roleExists");
    }

    /**
     * Clear translation-related caches
     */
    public void clearTranslationCaches() {
        clearCache("translations");
        clearCache("translationMaps");
        clearCache("translationKeys");
        clearCache("translationLanguages");
        clearCache("translationExists");
    }

    /**
     * Clear file-related caches
     */
    public void clearFileCaches() {
        clearCache("files");
        clearCache("fileStats");
        clearCache("fileExists");
    }
}
