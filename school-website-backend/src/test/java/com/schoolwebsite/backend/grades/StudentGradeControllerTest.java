package com.schoolwebsite.backend.grades;

import com.schoolwebsite.backend.tenantsubscription.Tenant;
import com.schoolwebsite.backend.tenantsubscription.TenantRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class StudentGradeControllerTest {

    @Autowired
    private StudentGradeRepository repository;

    @Autowired
    private TenantRepository tenantRepository;

    @Test
    public void testGradesDemographicsAndLookups() {
        // Create Tenant
        Tenant tenant = Tenant.builder()
                .name("Springfield School")
                .subdomain("springfield")
                .status("ACTIVE")
                .build();
        Tenant savedTenant = tenantRepository.save(tenant);
        Long tenantId = savedTenant.getId();

        // Save a Student Grade record with demographics
        StudentGrade grade = StudentGrade.builder()
                .tenantId(tenantId)
                .studentName("Bart Simpson")
                .subjectName("Mathematics")
                .term("Term 1 Midterm")
                .grade("C-")
                .remarks("Needs to focus more on home assignments.")
                .admissionNo("ADM-201")
                .classLevel("4th")
                .section("B")
                .fatherName("Homer Simpson")
                .aadharNo("1111-2222-3333")
                .build();

        StudentGrade saved = repository.save(grade);
        assertNotNull(saved.getId());
        assertEquals("ADM-201", saved.getAdmissionNo());
        assertEquals("4th", saved.getClassLevel());
        assertEquals("B", saved.getSection());

        // Test class-wise search lookup
        List<StudentGrade> classList = repository.findByTenantIdAndClassLevelAndSectionOrderByCreatedAtDesc(
                tenantId, "4th", "B");
        assertFalse(classList.isEmpty());
        assertEquals("Bart Simpson", classList.get(0).getStudentName());

        // Test name-wise containing lookup
        List<StudentGrade> nameList = repository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(
                tenantId, "Bart");
        assertFalse(nameList.isEmpty());
        assertEquals("Bart Simpson", nameList.get(0).getStudentName());
    }
}
