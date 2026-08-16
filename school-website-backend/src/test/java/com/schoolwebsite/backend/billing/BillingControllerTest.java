package com.schoolwebsite.backend.billing;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.auth.security.AuthPrincipal;
import com.schoolwebsite.backend.billing.entity.FeeItem;
import com.schoolwebsite.backend.billing.entity.StudentInvoice;
import com.schoolwebsite.backend.billing.service.BillingService;
import com.schoolwebsite.backend.common.constant.AppConstants;
import com.schoolwebsite.backend.tenantsubscription.entity.Tenant;
import com.schoolwebsite.backend.tenantsubscription.repository.TenantRepository;

@SpringBootTest
@Transactional
public class BillingControllerTest {

    @Autowired
    private BillingService billingService;

    @Autowired
    private TenantRepository tenantRepository;

    @BeforeEach
    void authenticateSuperAdmin() {
        AuthPrincipal principal = new AuthPrincipal(1L, "test-super-admin", AppConstants.ROLE_SUPER_ADMIN, null);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(principal, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + AppConstants.ROLE_SUPER_ADMIN))));
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void testBillingPipeline() {
        // 1. Create a prerequisite tenant
        Tenant tenant = Tenant.builder().name("Oxbridge Academy").subdomain("oxbridge").status("ACTIVE").build();
        Tenant savedTenant = tenantRepository.save(tenant);
        Long tenantId = savedTenant.getId();

        // 2. Create a FeeItem Category
        FeeItem fee = FeeItem.builder().name("Lab Assessment Fee").amount(125.0)
                .description("Science lab equipment maintenance bill").gradeLevel("High School (G9-12)").build();

        FeeItem savedFee = billingService.createFeeItem(tenantId, fee);
        assertNotNull(savedFee.getId());
        assertEquals("Lab Assessment Fee", savedFee.getName());

        // 3. Generate a Student Invoice
        StudentInvoice invoice = StudentInvoice.builder().studentName("Peter Parker").gradeLevel("High School (G9-12)")
                .feeItemName("Lab Assessment Fee").amount(125.0).dueDate(LocalDateTime.now().plusDays(30)).build();

        StudentInvoice savedInvoice = billingService.generateInvoice(tenantId, invoice);
        assertNotNull(savedInvoice.getId());
        assertEquals("PENDING", savedInvoice.getStatus());

        // 4. Complete a mock payment checkout transaction
        StudentInvoice paidInvoice = billingService.payInvoice(savedInvoice.getId(), null);
        assertEquals("PAID", paidInvoice.getStatus());
        assertNotNull(paidInvoice.getPaymentDate());
    }
}
