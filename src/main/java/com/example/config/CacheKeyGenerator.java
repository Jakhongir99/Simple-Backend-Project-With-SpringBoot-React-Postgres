package com.example.config;

import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

@Component
public class CacheKeyGenerator implements KeyGenerator {

    @Override
    public Object generate(Object target, Method method, Object... params) {
        StringBuilder key = new StringBuilder();
        key.append(target.getClass().getSimpleName()).append(".");
        key.append(method.getName()).append(".");
        
        if (params != null && params.length > 0) {
            key.append(Arrays.toString(params));
        }
        
        return key.toString();
    }
}
