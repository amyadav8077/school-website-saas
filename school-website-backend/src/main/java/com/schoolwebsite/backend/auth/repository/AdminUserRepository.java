package com.schoolwebsite.backend.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.schoolwebsite.backend.auth.entity.*;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long>
{
    Optional<AdminUser> findByUsername(String username);

    Optional<AdminUser> findByTenantId(Long tenantId);

    Optional<AdminUser> findByEmail(String email);

    Optional<AdminUser> findByPhoneNumber(String phoneNumber);
}
