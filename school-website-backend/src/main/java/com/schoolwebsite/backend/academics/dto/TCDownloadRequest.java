package com.schoolwebsite.backend.academics.dto;

import lombok.Data;

/**
 * Identity details a caller must supply to download a Transfer Certificate that
 * was discovered via a class/section search. All three must match the record.
 */
@Data
public class TCDownloadRequest {
    private String admissionNo;
    private String dateOfBirth;
    private String aadharNo;
}
