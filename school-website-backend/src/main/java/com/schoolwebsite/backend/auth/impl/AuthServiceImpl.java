package com.schoolwebsite.backend.auth.impl;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.auth.entity.AdminUser;
import com.schoolwebsite.backend.auth.repository.AdminUserRepository;
import com.schoolwebsite.backend.auth.service.AuthService;
import com.schoolwebsite.backend.auth.util.OtpUtil;
import com.schoolwebsite.backend.common.constant.AppConstants;
import com.schoolwebsite.backend.tenantsubscription.repository.TenantRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AdminUserRepository adminUserRepository;

    private final TenantRepository tenantRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    @Transactional(readOnly = true)
    public Optional<AdminUser> authenticate(String username, String password) {
        log.info("Authenticating username={}", username);
        return adminUserRepository.findByUsername(username).filter(user -> user.getPassword().equals(password));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> buildLoginResponse(AdminUser user) {
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        response.put("tenantId", user.getTenantId());

        if (user.getTenantId() != null) {
            tenantRepository.findById(user.getTenantId()).ifPresent(tenant -> {
                response.put("tenantName", tenant.getName());
                response.put("subdomain", tenant.getSubdomain());
            });
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AdminUser> findByUsername(String username) {
        return adminUserRepository.findByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUsernameTakenByAnotherTenant(String username, Long tenantId) {
        Optional<AdminUser> existing = adminUserRepository.findByUsername(username);
        return existing.isPresent() && !existing.get().getTenantId().equals(tenantId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean tenantExists(Long tenantId) {
        return tenantRepository.findById(tenantId).isPresent();
    }

    @Override
    @Transactional
    public AdminUser saveTenantAdmin(String username, String password, Long tenantId) {
        log.info("Saving tenant admin for tenantId={}, username={}", tenantId, username);
        AdminUser adminUser = adminUserRepository.findByTenantId(tenantId).orElse(new AdminUser());
        adminUser.setUsername(username);
        adminUser.setPassword(password);
        adminUser.setRole(AppConstants.ROLE_TENANT_ADMIN);
        adminUser.setTenantId(tenantId);
        return adminUserRepository.save(adminUser);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AdminUser> findTenantAdmin(Long tenantId) {
        return adminUserRepository.findByTenantId(tenantId);
    }

    @Override
    @Transactional
    public void updatePassword(AdminUser user, String newPassword) {
        log.info("Updating password for username={}", user.getUsername());
        user.setPassword(newPassword);
        adminUserRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AdminUser> findByContact(String contact) {
        Optional<AdminUser> userOpt = adminUserRepository.findByEmail(contact);
        if (userOpt.isEmpty()) {
            userOpt = adminUserRepository.findByPhoneNumber(contact);
        }
        return userOpt;
    }

    @Override
    public String issueOtp(String contact) {
        String otp = OtpUtil.generateAndStore(contact);
        sendOtpEmailIfApplicable(contact, otp);
        logOtpToConsole(contact, otp);
        return otp;
    }

    @Override
    public boolean verifyOtp(String contact, String enteredOtp) {
        boolean valid = OtpUtil.isValid(contact, enteredOtp);
        if (valid) {
            OtpUtil.invalidate(contact);
        }
        return valid;
    }

    private void sendOtpEmailIfApplicable(String contact, String otp) {
        if (!contact.contains("@") || mailSender == null) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(AppConstants.MAIL_FROM);
            message.setTo(contact);
            message.setSubject("SchoolSaaS.com - Secure Password Recovery OTP Code");
            message.setText(
                    "Hello,\n\n" + "You have requested a secure password override for your administrative console.\n"
                            + "Your security verification OTP code is:\n\n" + "🔑   " + otp + "   🔑\n\n"
                            + "This code is valid for exactly " + OtpUtil.getValidityMinutes() + " minutes.\n"
                            + "If you did not initiate this request, please change your password immediately.\n\n"
                            + "Best regards,\n" + "Unified Security Team\n" + "SchoolSaaS.com");
            mailSender.send(message);
            log.info("Secure SMTP OTP email sent to {}", contact);
        } catch (Exception e) {
            log.error("Failed to send SMTP OTP email to {}: {}", contact, e.getMessage());
        }
    }

    private void logOtpToConsole(String contact, String otp) {
        log.info("SECURE OTP dispatched to {} : {}", contact, otp);
    }
}
