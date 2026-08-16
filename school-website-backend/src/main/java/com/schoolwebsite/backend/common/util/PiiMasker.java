package com.schoolwebsite.backend.common.util;

/**
 * Central place for masking personally identifiable information before it is
 * returned in API responses. Keeping this in one utility prevents the masking
 * rules from drifting between modules (e.g. TC vs invoices).
 */
public final class PiiMasker {
    private PiiMasker() {
    }

    /**
     * Masks an Aadhaar (or similar national ID) leaving only the last 4 digits,
     * e.g. "123456789012" -> "XXXX-XXXX-9012". Null/short values are returned
     * unchanged.
     */
    public static String maskAadhaar(String aadhaar) {
        if (aadhaar == null || aadhaar.length() <= 4) {
            return aadhaar;
        }
        return "XXXX-XXXX-" + aadhaar.substring(aadhaar.length() - 4);
    }
}
