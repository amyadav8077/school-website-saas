package com.schoolwebsite.backend.auth.util;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

public class OtpUtilTest {

    @Test
    public void testGenerateAndValidate() {
        String contact = "otp-user@example.com";
        String otp = OtpUtil.generateAndStore(contact);

        assertNotNull(otp);
        assertEquals(6, otp.length());
        assertTrue(otp.matches("\\d{6}"));

        assertTrue(OtpUtil.isValid(contact, otp));
        assertFalse(OtpUtil.isValid(contact, "000000-wrong"));
    }

    @Test
    public void testInvalidateRemovesOtp() {
        String contact = "invalidate@example.com";
        String otp = OtpUtil.generateAndStore(contact);

        assertTrue(OtpUtil.isValid(contact, otp));
        OtpUtil.invalidate(contact);
        assertFalse(OtpUtil.isValid(contact, otp));
    }

    @Test
    public void testUnknownContactIsInvalid() {
        assertFalse(OtpUtil.isValid("never-issued@example.com", "123456"));
    }
}
