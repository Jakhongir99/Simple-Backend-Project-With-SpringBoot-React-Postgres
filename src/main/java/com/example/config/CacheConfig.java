package com.example.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Arrays;

@Configuration
@EnableCaching
@ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30)) // Default TTL of 30 minutes
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .withCacheConfiguration("users", 
                    config.entryTtl(Duration.ofMinutes(15)))
                .withCacheConfiguration("roles", 
                    config.entryTtl(Duration.ofMinutes(30)))
                .withCacheConfiguration("translations", 
                    config.entryTtl(Duration.ofHours(1)))
                .withCacheConfiguration("files", 
                    config.entryTtl(Duration.ofMinutes(10)))
                .build();
    }

    @Bean
    public KeyGenerator customKeyGenerator() {
        return (target, method, params) -> {
            StringBuilder sb = new StringBuilder();
            sb.append(target.getClass().getSimpleName()).append(".");
            sb.append(method.getName()).append(".");
            
            if (params != null && params.length > 0) {
                for (Object param : params) {
                    if (param != null) {
                        sb.append(param.toString()).append(".");
                    }
                }
            }
            
            return sb.toString();
        };
    }

    @Bean
    public KeyGenerator userKeyGenerator() {
        return (target, method, params) -> {
            StringBuilder sb = new StringBuilder("user.");
            sb.append(method.getName()).append(".");
            
            if (params != null && params.length > 0) {
                for (Object param : params) {
                    if (param != null) {
                        sb.append(param.toString()).append(".");
                    }
                }
            }
            
            return sb.toString();
        };
    }

    @Bean
    public KeyGenerator translationKeyGenerator() {
        return (target, method, params) -> {
            StringBuilder sb = new StringBuilder("translation.");
            sb.append(method.getName()).append(".");
            
            if (params != null && params.length > 0) {
                for (Object param : params) {
                    if (param != null) {
                        sb.append(param.toString()).append(".");
                    }
                }
            }
            
            return sb.toString();
        };
    }
}
