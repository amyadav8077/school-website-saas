package com.schoolwebsite.backend.analytics.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

/**
 * Aggregated website-visit metrics for the admin dashboard.
 */
@Getter
@Builder
public class VisitStatsResponse {
    private final long totalVisits;

    private final long visitsInRange;

    private final int rangeDays;

    /** One entry per day in the requested range, oldest first. */
    private final List<DailyPoint> daily;

    @Getter
    @Builder
    public static class DailyPoint {
        private final String date; // ISO yyyy-MM-dd
        private final String label; // short display label, e.g. "21 Aug"
        private final long count;
    }
}
