package com.schoolwebsite.backend.auth.service;

import java.util.Map;
import java.util.Optional;

import com.schoolwebsite.backend.auth.entity.AdminUser;

public interface AuthService {
    Optional<AdminUser> authenticate(String username, String password);

    Map<String, Object> buildLoginResponse(AdminUser user);

    Optional<AdminUser> findByUsername(String username);

    boolean isUsernameTakenByAnotherTenant(String username, Long tenantId);

    boolean tenantExists(Long tenantId);

    AdminUser saveTenantAdmin(String username, String password, Long tenantId);

    Optional<AdminUser> findTenantAdmin(Long tenantId);

    void updatePassword(AdminUser user, String newPassword);

    boolean checkPassword(AdminUser user, String rawPassword);

    Optional<AdminUser> findByContact(String contact);

    String issueOtp(String contact);

    boolean verifyOtp(String contact, String enteredOtp);

    /** Persists a new verified phone number on the given admin. */
    AdminUser updatePhoneNumber(AdminUser user, String newPhoneNumber);

    /** Persists a new verified email on the given admin. */
    AdminUser updateEmail(AdminUser user, String newEmail);
}
