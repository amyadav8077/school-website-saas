package com.schoolwebsite.backend.auth;

import com.schoolwebsite.backend.tenantsubscription.Tenant;
import com.schoolwebsite.backend.tenantsubscription.TenantRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    private final AdminUserRepository adminUserRepository;
    private final TenantRepository tenantRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<AdminUser> userOpt = adminUserRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password."));
        }

        AdminUser user = userOpt.get();
        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password."));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        response.put("tenantId", user.getTenantId());

        if (user.getTenantId() != null) {
            Optional<Tenant> tenantOpt = tenantRepository.findById(user.getTenantId());
            if (tenantOpt.isPresent()) {
                Tenant tenant = tenantOpt.get();
                response.put("tenantName", tenant.getName());
                response.put("subdomain", tenant.getSubdomain());
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/tenant-admins")
    public ResponseEntity<?> createOrUpdateTenantAdmin(@RequestBody TenantAdminCreateRequest request) {
        if (request.getTenantId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tenant ID is required."));
        }

        Optional<Tenant> tenantOpt = tenantRepository.findById(request.getTenantId());
        if (tenantOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tenant not found."));
        }

        // Check if username is already taken by another user
        Optional<AdminUser> existingWithUsername = adminUserRepository.findByUsername(request.getUsername());
        if (existingWithUsername.isPresent() && !existingWithUsername.get().getTenantId().equals(request.getTenantId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken by another tenant admin."));
        }

        AdminUser adminUser = adminUserRepository.findByTenantId(request.getTenantId())
                .orElse(new AdminUser());

        adminUser.setUsername(request.getUsername());
        adminUser.setPassword(request.getPassword());
        adminUser.setRole("TENANT_ADMIN");
        adminUser.setTenantId(request.getTenantId());

        adminUserRepository.save(adminUser);
        return ResponseEntity.ok(Map.of("message", "Tenant administrator credentials saved successfully!"));
    }

    @GetMapping("/tenant-admins/{tenantId}")
    public ResponseEntity<?> getTenantAdmin(@PathVariable Long tenantId) {
        Optional<AdminUser> adminOpt = adminUserRepository.findByTenantId(tenantId);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        AdminUser admin = adminOpt.get();
        Map<String, String> response = new HashMap<>();
        response.put("username", admin.getUsername());
        response.put("password", admin.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        Optional<AdminUser> userOpt = adminUserRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "User not found."));
        }

        AdminUser user = userOpt.get();
        if (!user.getPassword().equals(request.getOldPassword())) {
            return ResponseEntity.status(400).body(Map.of("message", "Incorrect current password."));
        }

        user.setPassword(request.getNewPassword());
        adminUserRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully!"));
    }

    private static final Map<String, OtpSession> otpCache = new java.util.concurrent.ConcurrentHashMap<>();

    private static class OtpSession {
        private final String otp;
        private final java.time.LocalDateTime expiry;

        public OtpSession(String otp, int validityMinutes) {
            this.otp = otp;
            this.expiry = java.time.LocalDateTime.now().plusMinutes(validityMinutes);
        }

        public boolean isExpired() {
            return java.time.LocalDateTime.now().isAfter(expiry);
        }

        public String getOtp() {
            return otp;
        }
    }

    @PostMapping("/forgot-password/request")
    public ResponseEntity<?> requestOtp(@RequestBody ForgotPasswordRequest request) {
        String contact = request.getContact() != null ? request.getContact().trim() : "";
        if (contact.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email or Phone Number is required."));
        }

        Optional<AdminUser> userOpt = adminUserRepository.findByEmail(contact);
        if (userOpt.isEmpty()) {
            userOpt = adminUserRepository.findByPhoneNumber(contact);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "No registered administrator account found with this email or phone number."));
        }

        // Generate 6-digit random OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        otpCache.put(contact, new OtpSession(otp, 5)); // 5 minutes validity

        // If it's an email format, send a real secure email!
        if (contact.contains("@") && mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("amityadav.ssdn@gmail.com");
                message.setTo(contact);
                message.setSubject("SchoolSaaS.com - Secure Password Recovery OTP Code");
                message.setText("Hello,\n\n"
                        + "You have requested a secure password override for your administrative console.\n"
                        + "Your security verification OTP code is:\n\n"
                        + "🔑   " + otp + "   🔑\n\n"
                        + "This code is valid for exactly 5 minutes.\n"
                        + "If you did not initiate this request, please change your password immediately.\n\n"
                        + "Best regards,\n"
                        + "Unified Security Team\n"
                        + "SchoolSaaS.com");
                mailSender.send(message);
                System.out.println("✅ Real secure SMTP email sent successfully to: " + contact);
            } catch (Exception e) {
                System.err.println("❌ Failed to send SMTP email: " + e.getMessage());
            }
        }

        // Print secure prominent console log (acts as Twilio / SMTP gateway simulate output)
        System.out.println("\n==============================================");
        System.out.println("📬 SECURE OTP SENT TO : " + contact);
        System.out.println("💬 MESSAGE: Your SchoolSaaS.com security verification code is: " + otp);
        System.out.println("==============================================\n");

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP security code successfully dispatched! For ease of demonstration/testing, we have also returned the code right here.");
        response.put("otp", otp); // Direct returned value for seamless demo!
        response.put("contact", contact);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        String contact = request.getContact() != null ? request.getContact().trim() : "";
        String enteredOtp = request.getOtp() != null ? request.getOtp().trim() : "";
        String newPassword = request.getNewPassword() != null ? request.getNewPassword() : "";

        if (contact.isEmpty() || enteredOtp.isEmpty() || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Contact, OTP, and New Password are required."));
        }

        OtpSession session = otpCache.get(contact);
        if (session == null || !session.getOtp().equals(enteredOtp) || session.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP token. Please request a new code."));
        }

        Optional<AdminUser> userOpt = adminUserRepository.findByEmail(contact);
        if (userOpt.isEmpty()) {
            userOpt = adminUserRepository.findByPhoneNumber(contact);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found during password override."));
        }

        AdminUser user = userOpt.get();
        user.setPassword(newPassword);
        adminUserRepository.save(user);

        otpCache.remove(contact); // Invalidate token

        return ResponseEntity.ok(Map.of("message", "Your password has been successfully reset! You can now log in with your new credentials."));
    }

    @Data
    public static class ForgotPasswordRequest {
        private String contact;
    }

    @Data
    public static class ResetPasswordRequest {
        private String contact;
        private String otp;
        private String newPassword;
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class TenantAdminCreateRequest {
        private String username;
        private String password;
        private Long tenantId;
    }

    @Data
    public static class ChangePasswordRequest {
        private String username;
        private String oldPassword;
        private String newPassword;
    }
}
