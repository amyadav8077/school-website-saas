package com.schoolwebsite.backend.common.util;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

public class StringUtilsTest {

    @Test
    public void testHasText() {
        assertTrue(StringUtils.hasText("hello"));
        assertTrue(StringUtils.hasText("  hello  "));
        assertFalse(StringUtils.hasText(null));
        assertFalse(StringUtils.hasText(""));
        assertFalse(StringUtils.hasText("   "));
    }

    @Test
    public void testTrimToNull() {
        assertEquals("hello", StringUtils.trimToNull("  hello  "));
        assertNull(StringUtils.trimToNull(null));
        assertNull(StringUtils.trimToNull(""));
        assertNull(StringUtils.trimToNull("   "));
    }
}
