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
    public ResponseEntity<TransferCertificate> verifyAndDownloadTC(
            @PathVariable Long tenantId,
            @RequestParam String admissionNo,
            @RequestParam String fatherName,
            @RequestParam String aadharNo) {
        
        return repository.findByTenantIdAndAdmissionNoAndFatherNameContainingIgnoreCaseAndAadharNo(
                tenantId, admissionNo, fatherName, aadharNo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
