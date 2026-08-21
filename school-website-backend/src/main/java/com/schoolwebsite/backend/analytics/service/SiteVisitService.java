package com.schoolwebsite.backend.analytics.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.schoolwebsite.backend.analytics.dto.VisitStatsResponse;
import com.schoolwebsite.backend.analytics.entity.SiteVisit;
import com.schoolwebsite.backend.analytics.repository.SiteVisitRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SiteVisitService {
    private static final DateTimeFormatter LABEL = DateTimeFormatter.ofPattern("d MMM");

    private final SiteVisitRepository repository;

    /** Records one public page load. Fails silently-safe (caller ignores errors). */
    public void record(Long tenantId, String path) {
        String trimmed = path == null ? null : (path.length() > 500 ? path.substring(0, 500) : path);
        repository.save(SiteVisit.builder().tenantId(tenantId).path(trimmed).build());
    }

    public VisitStatsResponse getStats(Long tenantId, int days) {
        int range = Math.max(1, Math.min(days, 90));
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(range - 1L);
        LocalDateTime since = start.atStartOfDay();

        // Bucket DB rows by ISO day string.
        Map<String, Long> byDay = new LinkedHashMap<>();
        for (Object[] row : repository.countDailySince(tenantId, since)) {
            LocalDate day = toLocalDate(row[0]);
            long count = ((Number) row[1]).longValue();
            if (day != null) {
                byDay.put(day.toString(), count);
            }
        }

        // Emit one point per day so the chart has a bar for every day (zeros included).
        List<VisitStatsResponse.DailyPoint> daily = new ArrayList<>();
        long inRange = 0;
        for (int i = 0; i < range; i++) {
            LocalDate d = start.plusDays(i);
            long c = byDay.getOrDefault(d.toString(), 0L);
            inRange += c;
            daily.add(VisitStatsResponse.DailyPoint.builder()
                    .date(d.toString())
                    .label(d.format(LABEL))
                    .count(c)
                    .build());
        }

        return VisitStatsResponse.builder()
                .totalVisits(repository.countByTenantId(tenantId))
                .visitsInRange(inRange)
                .rangeDays(range)
                .daily(daily)
                .build();
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof java.sql.Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        if (value instanceof LocalDate ld) {
            return ld;
        }
        if (value instanceof java.time.LocalDateTime ldt) {
            return ldt.toLocalDate();
        }
        return value == null ? null : LocalDate.parse(value.toString());
    }
}
