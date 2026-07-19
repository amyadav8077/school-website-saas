package com.schoolwebsite.backend.billing;

import com.schoolwebsite.backend.tenantsubscription.Tenant;
import com.schoolwebsite.backend.tenantsubscription.TenantRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class BillingControllerTest {

    @Autowired
    private BillingService billingService;

    @Autowired
    private TenantRepository tenantRepository;

    @Test
    public void testBillingPipeline() {
        // 1. Create a prerequisite tenant
        Tenant tenant = Tenant.builder()
                .name("Oxbridge Academy")
                .subdomain("oxbridge")
                .status("ACTIVE")
                .build();
        Tenant savedTenant = tenantRepository.save(tenant);
        Long tenantId = savedTenant.getId();

        // 2. Create a FeeItem Category
        FeeItem fee = FeeItem.builder()
                .name("Lab Assessment Fee")
                .amount(125.0)
                .description("Science lab equipment maintenance bill")
                .gradeLevel("High School (G9-12)")
                .build();

        FeeItem savedFee = billingService.createFeeItem(tenantId, fee);
        assertNotNull(savedFee.getId());
        assertEquals("Lab Assessment Fee", savedFee.getName());

        // 3. Generate a Student Invoice
        StudentInvoice invoice = StudentInvoice.builder()
                .studentName("Peter Parker")
                .gradeLevel("High School (G9-12)")
                .feeItemName("Lab Assessment Fee")
                .amount(125.0)
                .dueDate(LocalDateTime.now().plusDays(30))
                .build();

        StudentInvoice savedInvoice = billingService.generateInvoice(tenantId, invoice);
        assertNotNull(savedInvoice.getId());
        assertEquals("PENDING", savedInvoice.getStatus());

        // 4. Complete a mock payment checkout transaction
        StudentInvoice paidInvoice = billingService.payInvoice(savedInvoice.getId());
        assertEquals("PAID", paidInvoice.getStatus());
        assertNotNull(paidInvoice.getPaymentDate());
    }
}
