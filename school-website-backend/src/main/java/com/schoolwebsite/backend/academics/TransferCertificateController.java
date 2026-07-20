package com.schoolwebsite.backend.academics;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TransferCertificateController {

    private final TransferCertificateRepository repository;

    // Public / Parents verification lookup
    @GetMapping("/sites/{tenantId}/tc")
    public ResponseEntity<List<TransferCertificate>> verifyAndDownloadTC(
            @PathVariable Long tenantId,
            @RequestParam(required = false) String classLevel,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String admissionNo,
            @RequestParam(required = false) String fatherName,
            @RequestParam(required = false) String aadharNo) {
        
        if (studentName != null && !studentName.trim().isEmpty()) {
            List<TransferCertificate> res = repository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByIssueDateDesc(
                    tenantId, studentName.trim());
            return ResponseEntity.ok(res);
        } else if (classLevel != null && !classLevel.trim().isEmpty() && section != null && !section.trim().isEmpty()) {
            List<TransferCertificate> res = repository.findByTenantIdAndClassLevelAndSectionOrderByIssueDateDesc(
                    tenantId, classLevel.trim(), section.trim());
            return ResponseEntity.ok(res);
        } else if (admissionNo != null && !admissionNo.trim().isEmpty()) {
            if (fatherName != null && !fatherName.trim().isEmpty() && aadharNo != null && !aadharNo.trim().isEmpty()) {
                // Classic CBSE security-compliant verification
                return repository.findByTenantIdAndAdmissionNoAndFatherNameContainingIgnoreCaseAndAadharNo(
                        tenantId, admissionNo.trim(), fatherName.trim(), aadharNo.trim())
                        .map(tc -> ResponseEntity.ok(List.of(tc)))
                        .orElse(ResponseEntity.ok(List.of()));
            } else {
                List<TransferCertificate> res = repository.findByTenantIdAndAdmissionNoOrderByIssueDateDesc(
                        tenantId, admissionNo.trim());
                return ResponseEntity.ok(res);
            }
        }
        
        List<TransferCertificate> res = repository.findByTenantIdOrderByIssueDateDesc(tenantId);
        return ResponseEntity.ok(res);
    }

    // Admin list issued TCs
    @GetMapping("/admin/sites/{tenantId}/tc")
    public ResponseEntity<List<TransferCertificate>> getIssuedTCs(@PathVariable Long tenantId) {
        List<TransferCertificate> list = repository.findByTenantIdOrderByIssueDateDesc(tenantId);
        return ResponseEntity.ok(list);
    }

    // Admin Issue/Upload TC
    @PostMapping("/admin/sites/{tenantId}/tc")
    public ResponseEntity<TransferCertificate> issueTC(
            @PathVariable Long tenantId,
            @Valid @RequestBody TransferCertificate tc) {
        tc.setTenantId(tenantId);
        if (tc.getIssueDate() == null) {
            tc.setIssueDate(LocalDateTime.now());
        }
        TransferCertificate saved = repository.save(tc);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Admin Delete TC record
    @DeleteMapping("/admin/tc/{id}")
    public ResponseEntity<Void> deleteTC(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
