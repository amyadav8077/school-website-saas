package com.schoolwebsite.backend.notification;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.schoolwebsite.backend.auth.repository.AdminUserRepository;
import com.schoolwebsite.backend.common.util.StringUtils;
import com.schoolwebsite.backend.tenantsubscription.repository.TenantRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Notifies the tenant's administrator whenever an end user submits a request
 * (admission lead, support/contact inquiry, or job application). The recipient
 * is the tenant admin's stored email; if that is absent, a configured fallback
 * address is used. All sends are best-effort (see {@link EmailService}).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    private final AdminUserRepository adminUserRepository;
    private final TenantRepository tenantRepository;
    private final EmailService emailService;

    @Value("${app.mail.admin-fallback:}")
    private String fallbackRecipient;

    public void notifyNewAdmissionLead(Long tenantId, String studentName, String gradeLevel, String parentName,
            String parentEmail, String parentPhone, String message) {
        String subject = "New Admission Inquiry — " + safe(studentName);
        String body = "A new admission inquiry has been submitted on your school website.\n\n" + "Student Name : "
                + safe(studentName) + "\n" + "Grade Level  : " + safe(gradeLevel) + "\n" + "Parent Name  : "
                + safe(parentName) + "\n" + "Parent Email : " + safe(parentEmail) + "\n" + "Parent Phone : "
                + safe(parentPhone) + "\n" + "Message      : " + safe(message) + "\n\n"
                + "Log in to your admin dashboard to review and respond.";
        dispatch(tenantId, subject, body);
    }

    public void notifyNewSupportInquiry(Long tenantId, String senderName, String senderEmail, String subjectLine,
            String message) {
        String subject = "New Contact Inquiry — " + safe(subjectLine);
        String body = "A new contact/support inquiry has been submitted on your school website.\n\n" + "From    : "
                + safe(senderName) + "\n" + "Email   : " + safe(senderEmail) + "\n" + "Subject : " + safe(subjectLine)
                + "\n" + "Message : " + safe(message) + "\n\n"
                + "Log in to your admin dashboard to review and respond.";
        dispatch(tenantId, subject, body);
    }

    public void notifyNewJobApplication(Long tenantId, String jobTitle, String candidateName, String candidateEmail,
            String candidatePhone) {
        String subject = "New Job Application — " + safe(jobTitle);
        String body = "A new job application has been submitted on your school website.\n\n" + "Position       : "
                + safe(jobTitle) + "\n" + "Candidate Name : " + safe(candidateName) + "\n" + "Candidate Email: "
                + safe(candidateEmail) + "\n" + "Candidate Phone: " + safe(candidatePhone) + "\n\n"
                + "Log in to your admin dashboard to review the application.";
        dispatch(tenantId, subject, body);
    }

    /** Resolves the tenant admin recipient and dispatches the email. */
    private void dispatch(Long tenantId, String subject, String body) {
        String recipient = resolveRecipient(tenantId);
        if (!StringUtils.hasText(recipient)) {
            log.info("No admin email on file for tenantId={} and no fallback configured; skipping '{}'", tenantId,
                    subject);
            return;
        }
        String tenantName = tenantRepository.findById(tenantId).map(t -> t.getName()).orElse(null);
        String prefixedSubject = StringUtils.hasText(tenantName) ? "[" + tenantName + "] " + subject : subject;
        emailService.sendPlainText(recipient, prefixedSubject, body);
    }

    private String resolveRecipient(Long tenantId) {
        String adminEmail = adminUserRepository.findByTenantId(tenantId).map(u -> u.getEmail()).orElse(null);
        if (StringUtils.hasText(adminEmail)) {
            return adminEmail.trim();
        }
        return StringUtils.hasText(fallbackRecipient) ? fallbackRecipient.trim() : null;
    }

    private String safe(String value) {
        return StringUtils.hasText(value) ? value : "—";
    }
}
