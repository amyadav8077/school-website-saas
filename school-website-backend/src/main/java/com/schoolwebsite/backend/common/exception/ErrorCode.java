package com.schoolwebsite.backend.common.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {

    // ── Generic ─────────────────────────────────────────────────────────────
    VALIDATION_ERROR("ERR-0001", HttpStatus.BAD_REQUEST, "%s"), INTERNAL_ERROR("ERR-0002",
            HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred"),

    // ── Academics ───────────────────────────────────────────────────────────
    ACADEMIC_COURSE_NOT_FOUND("ERR-1001", HttpStatus.NOT_FOUND,
            "Academic course not found with id: %s"), ACADEMIC_PROGRAM_NOT_FOUND("ERR-1002", HttpStatus.NOT_FOUND,
                    "Academic program not found with id: %s"), BOARD_RESULT_NOT_FOUND("ERR-1003", HttpStatus.NOT_FOUND,
                            "Board result not found with id: %s"), ENRICHMENT_ACTIVITY_NOT_FOUND("ERR-1004",
                                    HttpStatus.NOT_FOUND,
                                    "Enrichment activity not found with id: %s"), FACULTY_MEMBER_NOT_FOUND("ERR-1005",
                                            HttpStatus.NOT_FOUND,
                                            "Faculty member not found with id: %s"), GALLERY_ITEM_NOT_FOUND("ERR-1006",
                                                    HttpStatus.NOT_FOUND,
                                                    "Gallery item not found with id: %s"), SCHOOL_BRANCH_NOT_FOUND(
                                                            "ERR-1007", HttpStatus.NOT_FOUND,
                                                            "School branch not found with id: %s"), STUDENT_ACHIEVER_NOT_FOUND(
                                                                    "ERR-1008", HttpStatus.NOT_FOUND,
                                                                    "Student achiever not found with id: %s"), TRANSFER_CERTIFICATE_NOT_FOUND(
                                                                            "ERR-1009", HttpStatus.NOT_FOUND,
                                                                            "Transfer certificate not found with id: %s"), JOB_POSTING_NOT_FOUND(
                                                                                    "ERR-1010", HttpStatus.NOT_FOUND,
                                                                                    "Job posting not found with id: %s"), JOB_APPLICATION_NOT_FOUND(
                                                                                            "ERR-1011",
                                                                                            HttpStatus.NOT_FOUND,
                                                                                            "Job application not found with id: %s"),

    // ── Admissions ──────────────────────────────────────────────────────────
    ADMISSION_LEAD_NOT_FOUND("ERR-2001", HttpStatus.NOT_FOUND, "Admission lead not found with id: %s"),

    // ── Billing ─────────────────────────────────────────────────────────────
    INVOICE_NOT_FOUND("ERR-3001", HttpStatus.NOT_FOUND, "Invoice not found with id: %s"),

    // ── Grades ──────────────────────────────────────────────────────────────
    STUDENT_GRADE_NOT_FOUND("ERR-4001", HttpStatus.NOT_FOUND, "Student grade not found with id: %s"),

    // ── Notifications ───────────────────────────────────────────────────────
    SCHOOL_EVENT_NOT_FOUND("ERR-5001", HttpStatus.NOT_FOUND,
            "School event not found with id: %s"), SCHOOL_NEWS_NOT_FOUND("ERR-5002", HttpStatus.NOT_FOUND,
                    "School news not found with id: %s"),

    // ── Page Builder ────────────────────────────────────────────────────────
    PAGE_NOT_FOUND_BY_ID("ERR-6001", HttpStatus.NOT_FOUND, "Page not found with id: %s"), PAGE_NOT_FOUND_BY_SLUG(
            "ERR-6002", HttpStatus.NOT_FOUND, "Page not found with slug: %s"), PAGE_SLUG_CONFLICT("ERR-6003",
                    HttpStatus.CONFLICT, "A page with slug '%s' already exists for this tenant"),

    // ── Site Configuration ──────────────────────────────────────────────────
    SUBDOMAIN_NOT_FOUND("ERR-7001", HttpStatus.NOT_FOUND, "Subdomain not found: %s"), SITE_CONFIG_NOT_FOUND_BY_TENANT(
            "ERR-7002", HttpStatus.NOT_FOUND,
            "Site configuration not found for tenant: %s"), SITE_CONFIG_NOT_FOUND_BY_TENANT_ID("ERR-7003",
                    HttpStatus.NOT_FOUND, "Site configuration not found for tenant id: %s"),

    // ── Support ─────────────────────────────────────────────────────────────
    SUPPORT_INQUIRY_NOT_FOUND("ERR-8001", HttpStatus.NOT_FOUND, "Support inquiry not found with id: %s"),

    // ── Tenant Subscription ─────────────────────────────────────────────────
    TENANT_NOT_FOUND_BY_ID("ERR-9001", HttpStatus.NOT_FOUND,
            "Tenant not found with id: %s"), TENANT_NOT_FOUND_BY_SUBDOMAIN("ERR-9002", HttpStatus.NOT_FOUND,
                    "Tenant not found with subdomain: %s"), SOURCE_TENANT_NOT_FOUND("ERR-9003", HttpStatus.NOT_FOUND,
                            "Source Tenant not found with id: %s"), SUBDOMAIN_ALREADY_TAKEN("ERR-9004",
                                    HttpStatus.CONFLICT, "Subdomain is already taken"), SCHOOL_NAME_ALREADY_REGISTERED(
                                            "ERR-9005", HttpStatus.CONFLICT,
                                            "School name is already registered"), TENANT_NOT_FOUND_BY_HOST("ERR-9006",
                                                    HttpStatus.NOT_FOUND, "No tenant is mapped to host: %s");

    private final String code;

    private final HttpStatus status;

    private final String messageTemplate;

    ErrorCode(String code, HttpStatus status, String messageTemplate) {
        this.code = code;
        this.status = status;
        this.messageTemplate = messageTemplate;
    }

    public String format(Object... args) {
        return args == null || args.length == 0 ? messageTemplate : String.format(messageTemplate, args);
    }
}
