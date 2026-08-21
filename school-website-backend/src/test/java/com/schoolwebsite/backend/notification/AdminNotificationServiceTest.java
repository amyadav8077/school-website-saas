package com.schoolwebsite.backend.notification;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.schoolwebsite.backend.auth.entity.AdminUser;
import com.schoolwebsite.backend.auth.repository.AdminUserRepository;
import com.schoolwebsite.backend.tenantsubscription.entity.Tenant;
import com.schoolwebsite.backend.tenantsubscription.repository.TenantRepository;

/**
 * Unit tests for recipient resolution and message composition in
 * {@link AdminNotificationService}. The email transport is mocked so no SMTP is
 * involved.
 */
@ExtendWith(MockitoExtension.class)
public class AdminNotificationServiceTest {

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AdminNotificationService service;

    @BeforeEach
    void resetFallback() {
        ReflectionTestUtils.setField(service, "fallbackRecipient", "");
    }

    @Test
    public void sendsToTenantAdminEmail_whenPresent() {
        AdminUser admin = AdminUser.builder().tenantId(5L).email("principal@school.edu").build();
        when(adminUserRepository.findByTenantId(5L)).thenReturn(Optional.of(admin));
        when(tenantRepository.findById(5L)).thenReturn(Optional.of(Tenant.builder().name("Green Valley").build()));

        service.notifyNewAdmissionLead(5L, "Sam", "Grade 5", "Dad", "dad@x.com", "+919876543210", "Hi");

        ArgumentCaptor<String> to = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> subject = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPlainText(to.capture(), subject.capture(), anyString());
        assertEquals("principal@school.edu", to.getValue());
        // Subject is prefixed with the tenant name.
        assertTrue(subject.getValue().startsWith("[Green Valley]"));
        assertTrue(subject.getValue().contains("Admission Inquiry"));
    }

    @Test
    public void fallsBackToConfiguredAddress_whenAdminHasNoEmail() {
        ReflectionTestUtils.setField(service, "fallbackRecipient", "ops@saas.com");
        AdminUser admin = AdminUser.builder().tenantId(7L).email(null).build();
        when(adminUserRepository.findByTenantId(7L)).thenReturn(Optional.of(admin));
        when(tenantRepository.findById(7L)).thenReturn(Optional.empty());

        service.notifyNewSupportInquiry(7L, "Jane", "jane@x.com", "Help", "Need info");

        ArgumentCaptor<String> to = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPlainText(to.capture(), anyString(), anyString());
        assertEquals("ops@saas.com", to.getValue());
    }

    @Test
    public void doesNotSend_whenNoRecipientAndNoFallback() {
        when(adminUserRepository.findByTenantId(9L)).thenReturn(Optional.empty());

        service.notifyNewJobApplication(9L, "Teacher", "Cand", "cand@x.com", "+911111111111");

        verifyNoInteractions(emailService);
    }
}
