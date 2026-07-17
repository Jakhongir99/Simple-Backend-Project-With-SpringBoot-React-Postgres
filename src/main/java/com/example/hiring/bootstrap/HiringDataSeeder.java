package com.example.hiring.bootstrap;

import com.example.hiring.entity.HiringRequest;
import com.example.hiring.enums.HiringStatus;
import com.example.hiring.repository.HiringRequestRepository;
import com.example.role.entity.Role;
import com.example.role.repository.RoleRepository;
import com.example.user.entity.User;
import com.example.user.enums.UserRole;
import com.example.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Seeds demo accounts (employee / HR / director) and a couple of sample
 * hiring requests so the workflow can be tried immediately.
 *
 * All accounts use the password: password123
 * Idempotent: only creates rows that do not already exist.
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class HiringDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HiringRequestRepository hiringRequestRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD = "password123";

    // Descriptions for the default roles that back the security checks.
    private static final List<String[]> DEFAULT_ROLES = Arrays.asList(
            new String[]{"USER", "Oddiy foydalanuvchi"},
            new String[]{"ADMIN", "Administrator - barcha huquqlar"},
            new String[]{"HR", "HR - arizalarni birlamchi ko'rib chiqadi"},
            new String[]{"DIRECTOR", "Direktor - yakuniy tasdiqlaydi"}
    );

    @Override
    public void run(String... args) {
        seedRoles();

        seedUser("Employee Demo", "employee@example.com", "+998900000001", UserRole.USER);
        seedUser("HR Demo", "hr@example.com", "+998900000002", UserRole.HR);
        seedUser("Director Demo", "director@example.com", "+998900000003", UserRole.DIRECTOR);

        seedSampleRequests();
    }

    private void seedRoles() {
        for (String[] r : DEFAULT_ROLES) {
            if (!roleRepository.existsByName(r[0])) {
                Role role = new Role();
                role.setName(r[0]);
                role.setDescription(r[1]);
                role.setIsActive(true);
                roleRepository.save(role);
                log.info("Seeded role: {}", r[0]);
            }
        }
    }

    private void seedUser(String name, String email, String phone, UserRole role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = User.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(role)
                .emailVerified(true)
                .build();
        userRepository.save(user);
        log.info("Seeded demo user: {} ({})", email, role);
    }

    private void seedSampleRequests() {
        if (hiringRequestRepository.count() > 0) {
            return;
        }
        hiringRequestRepository.save(HiringRequest.builder()
                .candidateName("Ali Valiyev")
                .candidateEmail("ali.valiyev@example.com")
                .position("Frontend Developer")
                .department("Engineering")
                .status(HiringStatus.SUBMITTED)
                .submittedBy("employee@example.com")
                .build());

        hiringRequestRepository.save(HiringRequest.builder()
                .candidateName("Dilnoza Karimova")
                .candidateEmail("dilnoza.karimova@example.com")
                .position("HR Specialist")
                .department("People Ops")
                .status(HiringStatus.SUBMITTED)
                .submittedBy("employee@example.com")
                .build());

        log.info("Seeded sample hiring requests");
    }
}
