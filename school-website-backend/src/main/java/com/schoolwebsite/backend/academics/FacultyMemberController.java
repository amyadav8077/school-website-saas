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
public class FacultyMemberController {

    private final FacultyMemberRepository repository;

    @GetMapping("/sites/{tenantId}/faculty")
    public ResponseEntity<List<FacultyMember>> getFaculty(@PathVariable Long tenantId) {
        List<FacultyMember> faculty = repository.findByTenantId(tenantId);
        return ResponseEntity.ok(faculty);
    }

    @PostMapping("/admin/sites/{tenantId}/faculty")
    public ResponseEntity<FacultyMember> createFaculty(
            @PathVariable Long tenantId,
            @Valid @RequestBody FacultyMember member) {
        member.setTenantId(tenantId);
        FacultyMember saved = repository.save(member);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/faculty/{id}")
    public ResponseEntity<Void> deleteFaculty(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
