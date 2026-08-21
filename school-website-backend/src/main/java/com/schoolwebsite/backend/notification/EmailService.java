package com.schoolwebsite.backend.notification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.schoolwebsite.backend.common.util.StringUtils;

import lombok.extern.slf4j.Slf4j;

/**
 * Central, reusable email sender. Sending is asynchronous so request threads are
 * never blocked by SMTP latency, and failures are logged rather than propagated
 * (a lead/application must still be persisted even if the notification fails).
 *
 * The {@link JavaMailSender} is optional: when no SMTP credentials are
 * configured the bean is absent and this service becomes a safe no-op.
 */
@Slf4j
@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@schoolsaas.local}")
    private String mailFrom;

    /** True when SMTP is configured and email can actually be delivered. */
    public boolean isEnabled() {
        return mailSender != null;
    }

    /**
     * Sends a plain-text email asynchronously. Missing recipient or unconfigured
     * mail sender results in a logged skip, never an exception.
     */
    @Async
    public void sendPlainText(String to, String subject, String body) {
        if (!StringUtils.hasText(to)) {
            log.debug("Skipping email '{}' — no recipient address", subject);
            return;
        }
        if (mailSender == null) {
            log.info("Mail not configured; skipping email '{}' to {}", subject, to);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Sent email '{}' to {}", subject, to);
        } catch (Exception ex) {
            log.warn("Failed to send email '{}' to {}: {}", subject, to, ex.getMessage());
        }
    }
}
