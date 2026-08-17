package com.schoolwebsite.backend.billing.dto;

import lombok.Data;

/**
 * Identity details a caller must supply to view/pay a student's invoices that
 * were discovered via a class/section search. All four must match the records.
 */
@Data
public class InvoiceVerifyRequest {
    private String admissionNo;
    private String fatherName;
    private String dateOfBirth;
    private String aadharNo;
}
