package com.example.user.scheduler;

import com.example.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserStatsScheduler {

    private final UserService userService;

    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void logUserCount() {
        try {
            long userCount = userService.getUserCount();
            log.info("Current user count: {}", userCount);
        } catch (Exception e) {
            log.error("Error getting user count: {}", e.getMessage());
        }
    }
}
