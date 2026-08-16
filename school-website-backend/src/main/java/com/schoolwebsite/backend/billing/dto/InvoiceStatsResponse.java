package com.schoolwebsite.backend.billing.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * DB-computed billing totals for a tenant, so the admin dashboard shows
 * accurate figures without loading every invoice.
 */
@Getter
@Builder
public class InvoiceStatsResponse {
    private final double totalBilled;

    private final double totalPaid;

    private final double totalPending;

    private final long invoiceCount;
}
