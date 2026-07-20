package com.schoolwebsite.backend.academics;

import com.schoolwebsite.backend.tenantsubscription.Tenant;
import com.schoolwebsite.backend.tenantsubscription.TenantRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class TransferCertificateControllerTest {

    @Autowired
    private TransferCertificateRepository repository;

    @Autowired
    private TenantRepository tenantRepository;

    @Test
    public void testTCLookupAndSearch() {
        // Create Tenant
        Tenant tenant = Tenant.builder()
                .name("Springfield High")
                .subdomain("sfhigh")
                .status("ACTIVE")
                .build();
        Tenant savedTenant = tenantRepository.save(tenant);
        Long tenantId = savedTenant.getId();

        // Create and save Transfer Certificate
        TransferCertificate tc = TransferCertificate.builder()
                .tenantId(tenantId)
                .studentName("Lisa Simpson")
                .admissionNo("ADM-456")
                .classLevel("8th")
                .section("A")
                .fatherName("Homer Simpson")
                .aadharNo("4444-5555-6666")
                .tcNumber("TC-2026-88")
                .issueDate(LocalDateTime.now())
                .build();

        TransferCertificate saved = repository.save(tc);
        assertNotNull(saved.getId());
        assertEquals("ADM-456", saved.getAdmissionNo());

        // Test Class & Section Lookup
        List<TransferCertificate> classList = repository.findByTenantIdAndClassLevelAndSectionOrderByIssueDateDesc(
                tenantId, "8th", "A");
        assertFalse(classList.isEmpty());
        assertEquals("Lisa Simpson", classList.get(0).getStudentName());

        // Test Name containing Lookup
        List<TransferCertificate> nameList = repository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByIssueDateDesc(
                tenantId, "lisa");
        assertFalse(nameList.isEmpty());
        assertEquals("Lisa Simpson", nameList.get(0).getStudentName());
    }
}
