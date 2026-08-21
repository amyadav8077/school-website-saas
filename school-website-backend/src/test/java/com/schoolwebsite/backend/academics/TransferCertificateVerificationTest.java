package com.schoolwebsite.backend.academics;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.TransferCertificate;
import com.schoolwebsite.backend.academics.repository.TransferCertificateRepository;
import com.schoolwebsite.backend.academics.service.TransferCertificateService;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.tenantsubscription.entity.Tenant;
import com.schoolwebsite.backend.tenantsubscription.repository.TenantRepository;

/**
 * Covers the simplified Transfer Certificate verification flow, which now uses
 * only Admission Number + Aadhaar (secure search) and Admission Number + Date of
 * Birth + Aadhaar (download verification) — Father's Name is no longer required.
 */
@SpringBootTest
@Transactional
public class TransferCertificateVerificationTest {

    @Autowired
    private TransferCertificateService service;

    @Autowired
    private TransferCertificateRepository repository;

    @Autowired
    private TenantRepository tenantRepository;

    private Long seedTenantWithTc() {
        Tenant tenant = Tenant.builder().name("Riverdale High").subdomain("riverdale").status("ACTIVE").build();
        Long tenantId = tenantRepository.save(tenant).getId();

        TransferCertificate tc = TransferCertificate.builder().tenantId(tenantId).studentName("Archie Andrews")
                .admissionNo("ADM-901").classLevel("10th").section("A").fatherName("Fred Andrews")
                .aadharNo("1234-5678-9012").dateOfBirth("2008-03-14").tcNumber("TC-2026-01")
                .issueDate(LocalDateTime.now()).build();
        repository.save(tc);
        return tenantId;
    }

    @Test
    public void secureSearch_matchesOnAdmissionAndAadhar_withoutFatherName() {
        Long tenantId = seedTenantWithTc();

        List<TransferCertificate> results = service.searchTCs(tenantId, null, null, null, "ADM-901", "1234-5678-9012");

        assertEquals(1, results.size());
        assertEquals("Archie Andrews", results.get(0).getStudentName());
        // Aadhaar is masked in secure-search output.
        assertNotEquals("1234-5678-9012", results.get(0).getAadharNo());
    }

    @Test
    public void secureSearch_wrongAadhar_returnsEmpty() {
        Long tenantId = seedTenantWithTc();

        List<TransferCertificate> results = service.searchTCs(tenantId, null, null, null, "ADM-901", "0000-0000-0000");

        assertTrue(results.isEmpty());
    }

    @Test
    public void search_withoutClassOrSecureTuple_throwsBadRequest() {
        Long tenantId = seedTenantWithTc();

        AppException ex = assertThrows(AppException.class,
                () -> service.searchTCs(tenantId, null, null, null, "ADM-901", null));
        assertTrue(ex.getMessage().contains("Admission Number and Aadhaar"));
    }

    @Test
    public void classSearch_listsCertificates_withMaskedDetails() {
        Long tenantId = seedTenantWithTc();

        List<TransferCertificate> results = service.searchTCs(tenantId, null, "10th", "A", null, null);

        assertEquals(1, results.size());
        assertEquals("Archie Andrews", results.get(0).getStudentName());
        // Listing masks the sensitive fields used for download verification.
        assertNull(results.get(0).getAadharNo());
        assertNull(results.get(0).getDateOfBirth());
        assertNull(results.get(0).getFatherName());
    }

    @Test
    public void verifyForDownload_correctTriple_returnsFullRecord() {
        Long tenantId = seedTenantWithTc();

        TransferCertificate tc = service.verifyForDownload(tenantId, "ADM-901", "2008-03-14", "1234-5678-9012");

        assertNotNull(tc);
        assertEquals("Archie Andrews", tc.getStudentName());
        // Full (unmasked) record is returned for download.
        assertEquals("1234-5678-9012", tc.getAadharNo());
    }

    @Test
    public void verifyForDownload_wrongDob_throwsBadRequest() {
        Long tenantId = seedTenantWithTc();

        AppException ex = assertThrows(AppException.class,
                () -> service.verifyForDownload(tenantId, "ADM-901", "2000-01-01", "1234-5678-9012"));
        assertTrue(ex.getMessage().contains("do not match"));
    }

    @Test
    public void verifyForDownload_missingField_throwsBadRequest() {
        Long tenantId = seedTenantWithTc();

        AppException ex = assertThrows(AppException.class,
                () -> service.verifyForDownload(tenantId, "ADM-901", "", "1234-5678-9012"));
        assertTrue(ex.getMessage().contains("Date of Birth"));
    }
}
