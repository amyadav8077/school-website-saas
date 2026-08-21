package com.schoolwebsite.backend.firebase;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import com.schoolwebsite.backend.common.exception.AppException;

/**
 * Unit tests for {@link FirebaseTokenService} when Firebase is NOT configured
 * (the default in local/dev/test). The optional FirebaseAuth bean is absent, so
 * verification must fail cleanly with an actionable message rather than an NPE.
 */
public class FirebaseTokenServiceTest {

    private final FirebaseTokenService service = new FirebaseTokenService();

    @Test
    public void isEnabled_falseWhenFirebaseAuthAbsent() {
        assertFalse(service.isEnabled());
    }

    @Test
    public void verify_whenDisabled_throwsClearMessage() {
        AppException ex = assertThrows(AppException.class, () -> service.verifyAndExtractPhone("any-token"));
        assertTrue(ex.getMessage().contains("not enabled"));
    }

    @Test
    public void verify_blankToken_whenDisabled_stillThrows() {
        assertThrows(AppException.class, () -> service.verifyAndExtractPhone(""));
    }
}
