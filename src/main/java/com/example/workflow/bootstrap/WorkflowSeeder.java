package com.example.workflow.bootstrap;

import com.example.workflow.entity.WorkflowProcess;
import com.example.workflow.repository.WorkflowProcessRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

/**
 * Seeds the default workflow processes from BPMN files under
 * src/main/resources/bpmn. Idempotent: skips keys that already exist so
 * user edits are never overwritten on restart.
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class WorkflowSeeder implements CommandLineRunner {

    private final WorkflowProcessRepository repository;

    // { key, name, description, resource file }
    private static final List<String[]> DEFAULTS = Arrays.asList(
            new String[]{"hiring", "Ishga olish jarayoni",
                    "Employee -> HR -> Director tasdiqlash oqimi", "bpmn/hiring.bpmn"},
            new String[]{"leave-request", "Ta'til so'rovi",
                    "Xodim ta'til so'raydi, rahbar tasdiqlaydi", "bpmn/leave-request.bpmn"},
            new String[]{"purchase-approval", "Xarid tasdiqlash",
                    "Xarid so'rovi moliya va director orqali", "bpmn/purchase-approval.bpmn"}
    );

    @Override
    public void run(String... args) {
        for (String[] d : DEFAULTS) {
            String key = d[0];
            if (repository.existsByProcessKey(key)) {
                continue;
            }
            String xml = readResource(d[3]);
            if (xml == null) {
                log.warn("Skipping process '{}' - resource {} not found", key, d[3]);
                continue;
            }
            WorkflowProcess process = WorkflowProcess.builder()
                    .processKey(key)
                    .name(d[1])
                    .description(d[2])
                    .bpmnXml(xml)
                    .isActive(true)
                    .build();
            repository.save(process);
            log.info("Seeded workflow process: {}", key);
        }
    }

    private String readResource(String path) {
        try (InputStream is = new ClassPathResource(path).getInputStream()) {
            return StreamUtils.copyToString(is, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to read BPMN resource {}: {}", path, e.getMessage());
            return null;
        }
    }
}
