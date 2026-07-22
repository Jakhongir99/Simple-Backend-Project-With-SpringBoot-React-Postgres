package com.example.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Releases a stale Liquibase changelog lock before migrations run.
 * Useful when a previous backend process was killed mid-migration.
 */
@Component
@Profile({"local", "default"})
@ConditionalOnProperty(name = "app.liquibase.unlock-on-startup", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class LiquibaseLockReleaseProcessor implements BeanPostProcessor {

    private final DataSource dataSource;
    private boolean unlocked;

    @Override
    public Object postProcessBeforeInitialization(@NonNull Object bean, @NonNull String beanName)
            throws BeansException {
        if (!unlocked && beanName.equals("liquibase")) {
            releaseLock();
            unlocked = true;
        }
        return bean;
    }

    private void releaseLock() {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            int updated = statement.executeUpdate(
                    "UPDATE databasechangeloglock SET locked = false, lockgranted = NULL, lockedby = NULL "
                            + "WHERE id = 1 AND locked = true");
            if (updated > 0) {
                log.warn("Released stale Liquibase changelog lock");
            }
        } catch (Exception e) {
            log.debug("Liquibase lock cleanup skipped: {}", e.getMessage());
        }
    }
}
