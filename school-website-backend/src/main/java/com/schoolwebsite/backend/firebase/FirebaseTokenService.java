package com.schoolwebsite.backend.firebase;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import com.schoolwebsite.backend.common.exception.AppException;

import lombok.extern.slf4j.Slf4j;

/**
 * Verifies Firebase ID tokens produced by the client after a successful phone
 * OTP sign-in, and extracts the verified phone number from the token claims.
 *
 * <p>{@link FirebaseAuth} is optional (only present when Firebase is enabled and
 * configured). When absent, verification fails cleanly with a clear message
 * instead of a {@code NoSuchBeanDefinitionException}.
 */
@Slf4j
@Service
public class FirebaseTokenService {

    @Autowired(required = false)
    private FirebaseAuth firebaseAuth;

    public boolean isEnabled() {
        return firebaseAuth != null;
    }

    /**
     * Verifies the supplied Firebase ID token and returns the verified phone
     * number in E.164 format (e.g. {@code +919876543210}).
     *
     * @throws AppException if Firebase is not configured, the token is invalid,
     *                      or the token carries no phone number.
     */
    public String verifyAndExtractPhone(String idToken) {
        if (firebaseAuth == null) {
            throw AppException
                    .badRequest("Phone OTP login is not enabled on this server. Configure Firebase to use it.");
        }
        if (idToken == null || idToken.isBlank()) {
            throw AppException.badRequest("Missing Firebase ID token.");
        }
        try {
            FirebaseToken decoded = firebaseAuth.verifyIdToken(idToken.trim());
            Object phone = decoded.getClaims().get("phone_number");
            if (phone == null || phone.toString().isBlank()) {
                throw AppException.badRequest("The verified token does not contain a phone number.");
            }
            return phone.toString();
        } catch (AppException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("Firebase ID token verification failed: {}", ex.getMessage());
            throw AppException.badRequest("Could not verify the OTP session. Please try signing in again.");
        }
    }
}
