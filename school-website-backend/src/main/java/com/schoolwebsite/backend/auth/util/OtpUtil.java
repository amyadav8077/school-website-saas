package com.schoolwebsite.backend.auth.util;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import com.schoolwebsite.backend.common.constant.AppConstants;

public final class OtpUtil {

    private static final int OTP_VALIDITY_MINUTES = AppConstants.OTP_VALIDITY_MINUTES;
    private static final Random RANDOM = new Random();
    private static final ConcurrentHashMap<String, OtpSession> OTP_CACHE = new ConcurrentHashMap<>();

    private OtpUtil() {
    }

    public static String generateAndStore(String contact) {
        String otp = String.format("%06d", RANDOM.nextInt(1000000));
        OTP_CACHE.put(contact, new OtpSession(otp, OTP_VALIDITY_MINUTES));
        return otp;
    }

    public static boolean isValid(String contact, String enteredOtp) {
        OtpSession session = OTP_CACHE.get(contact);
        return session != null && session.getOtp().equals(enteredOtp) && !session.isExpired();
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

        private OtpSession(String otp, int validityMinutes) {
            this.otp = otp;
            this.expiry = LocalDateTime.now().plusMinutes(validityMinutes);
        }

        private boolean isExpired() {
            return LocalDateTime.now().isAfter(expiry);
        }

        private String getOtp() {
            return otp;
        }
    }
}
