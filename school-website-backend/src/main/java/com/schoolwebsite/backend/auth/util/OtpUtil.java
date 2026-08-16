package com.schoolwebsite.backend.auth.util;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

import com.schoolwebsite.backend.common.constant.AppConstants;

public final class OtpUtil {
    private static final int OTP_VALIDITY_MINUTES = AppConstants.OTP_VALIDITY_MINUTES;

    private static final int MAX_VERIFY_ATTEMPTS = 5;

    // Cryptographically strong RNG so OTP codes cannot be predicted.
    private static final SecureRandom RANDOM = new SecureRandom();

    private static final ConcurrentHashMap<String, OtpSession> OTP_CACHE = new ConcurrentHashMap<>();

    private OtpUtil() {
    }

    public static String generateAndStore(String contact) {
        String otp = String.format("%06d", RANDOM.nextInt(1000000));
        OTP_CACHE.put(contact, new OtpSession(otp, OTP_VALIDITY_MINUTES));
        return otp;
    }

    /**
     * Validates an entered OTP, enforcing a max-attempts lockout so the 6-digit
     * code cannot be brute-forced. Exhausting attempts invalidates the OTP.
     */
    public static boolean isValid(String contact, String enteredOtp) {
        OtpSession session = OTP_CACHE.get(contact);
        if (session == null || session.isExpired()) {
            return false;
        }
        if (session.registerAttemptAndCheckLockout()) {
            OTP_CACHE.remove(contact);
            return false;
        }
        boolean matches = session.getOtp().equals(enteredOtp);
        if (matches) {
            OTP_CACHE.remove(contact);
        }
        return matches;
    }

    public static void invalidate(String contact) {
        OTP_CACHE.remove(contact);
    }

    public static int getValidityMinutes() {
        return OTP_VALIDITY_MINUTES;
    }

    private static final class OtpSession {
        private final String otp;

        private final LocalDateTime expiry;

        private int attempts;

        private OtpSession(String otp, int validityMinutes) {
            this.otp = otp;
            this.expiry = LocalDateTime.now().plusMinutes(validityMinutes);
            this.attempts = 0;
        }

        private boolean isExpired() {
            return LocalDateTime.now().isAfter(expiry);
        }

        /**
         * Increments the attempt counter; returns true once the cap is exceeded.
         */
        private synchronized boolean registerAttemptAndCheckLockout() {
            attempts++;
            return attempts > MAX_VERIFY_ATTEMPTS;
        }

        private String getOtp() {
            return otp;
        }
    }
}
