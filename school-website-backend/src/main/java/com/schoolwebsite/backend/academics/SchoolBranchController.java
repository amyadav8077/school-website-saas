package com.schoolwebsite.backend.academics;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class SchoolBranchController {

    private final SchoolBranchRepository repository;

    @GetMapping("/sites/{tenantId}/branches")
    public ResponseEntity<List<SchoolBranch>> getBranches(@PathVariable Long tenantId) {
        List<SchoolBranch> list = repository.findByTenantId(tenantId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/admin/sites/{tenantId}/branches")
    public ResponseEntity<SchoolBranch> createBranch(
            @PathVariable Long tenantId,
            @Valid @RequestBody SchoolBranch branch) {
        branch.setTenantId(tenantId);
        SchoolBranch saved = repository.save(branch);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/branches/{id}")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
