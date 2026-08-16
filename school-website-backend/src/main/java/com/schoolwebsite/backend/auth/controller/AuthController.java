package com.schoolwebsite.backend.auth.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.auth.entity.AdminUser;
import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.auth.service.AuthService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<AdminUser> userOpt = authService.authenticate(request.getUsername(), request.getPassword());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password."));
        }

        return ResponseEntity.ok(authService.buildLoginResponse(userOpt.get()));
    }

    @PostMapping("/tenant-admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> createOrUpdateTenantAdmin(@RequestBody TenantAdminCreateRequest request) {
        if (request.getTenantId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tenant ID is required."));
        }

        if (!authService.tenantExists(request.getTenantId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tenant not found."));
        }

        if (authService.isUsernameTakenByAnotherTenant(request.getUsername(), request.getTenantId())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Username is already taken by another tenant admin."));
        }

        authService.saveTenantAdmin(request.getUsername(), request.getPassword(), request.getTenantId());
        return ResponseEntity.ok(Map.of("message", "Tenant administrator credentials saved successfully!"));
    }

    @GetMapping("/tenant-admins/{tenantId}")
    public ResponseEntity<?> getTenantAdmin(@PathVariable Long tenantId) {
        // Only the owning tenant admin or a super-admin may read this.
        CurrentUser.assertTenantAccess(tenantId);
        Optional<AdminUser> adminOpt = authService.findTenantAdmin(tenantId);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        AdminUser admin = adminOpt.get();
        Map<String, String> response = new HashMap<>();
        response.put("username", admin.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        // Identity comes from the authenticated token, never from the request body.
        String username = CurrentUser.require().username();
        Optional<AdminUser> userOpt = authService.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "User not found."));
        }

        AdminUser user = userOpt.get();
        if (!authService.checkPassword(user, request.getOldPassword())) {
            return ResponseEntity.status(400).body(Map.of("message", "Incorrect current password."));
        }

        authService.updatePassword(user, request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password changed successfully!"));
    }

    @PostMapping("/forgot-password/request")
    public ResponseEntity<?> requestOtp(@RequestBody ForgotPasswordRequest request) {
        String contact = request.getContact() != null ? request.getContact().trim() : "";
        if (contact.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email or Phone Number is required."));
        }

        // Issue an OTP only if the account exists, but ALWAYS return the same
        // generic response so an attacker cannot enumerate registered accounts.
        if (authService.findByContact(contact).isPresent()) {
            authService.issueOtp(contact);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message",
                "If an administrator account matches this email or phone, a one-time code has been sent to it.");
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

        if (!authService.verifyOtp(contact, enteredOtp)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid or expired OTP token. Please request a new code."));
        }

        Optional<AdminUser> userOpt = authService.findByContact(contact);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found during password override."));
        }

        authService.updatePassword(userOpt.get(), newPassword);

        return ResponseEntity.ok(Map.of("message",
                "Your password has been successfully reset! You can now log in with your new credentials."));
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
