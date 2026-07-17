package com.example.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@EnableCaching
@ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // Use String serializer for keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        
        // Use JSON serializer for values
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        template.afterPropertiesSet();
        return template;
    }

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
                .withCacheConfiguration("userCounts", 
                    config.entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("userExists", 
                    config.entryTtl(Duration.ofMinutes(5)))
                .withCacheConfiguration("currentUser", 
                    config.entryTtl(Duration.ofMinutes(5)))
                .withCacheConfiguration("roles", 
                    config.entryTtl(Duration.ofMinutes(30)))
                .withCacheConfiguration("roleStats", 
                    config.entryTtl(Duration.ofMinutes(15)))
                .withCacheConfiguration("roleExists", 
                    config.entryTtl(Duration.ofMinutes(5)))
                .withCacheConfiguration("translations", 
                    config.entryTtl(Duration.ofHours(1)))
                .withCacheConfiguration("translationMaps", 
                    config.entryTtl(Duration.ofHours(2)))
                .withCacheConfiguration("translationKeys", 
                    config.entryTtl(Duration.ofHours(1)))
                .withCacheConfiguration("translationLanguages", 
                    config.entryTtl(Duration.ofHours(1)))
                .withCacheConfiguration("translationExists", 
                    config.entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("files", 
                    config.entryTtl(Duration.ofMinutes(15)))
                .withCacheConfiguration("fileStats", 
                    config.entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("fileExists", 
                    config.entryTtl(Duration.ofMinutes(5)))
                .build();
    }
}
