package com.example.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class UserStatsScheduler {

    private static final Logger log = LoggerFactory.getLogger(UserStatsScheduler.class);

    private final UserService userService;

    public UserStatsScheduler(UserService userService) {
        this.userService = userService;
    }

    // Runs every minute at second 0
    @Scheduled(cron = "0 * * * * *")
    public void logUserCount() {
        long count = userService.getUserCount();
        log.info("Current user count: {}", count);
    }
}


