package com.schoolwebsite.backend.grades;

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
public class StudentGradeController {

    private final StudentGradeRepository repository;

    // Public / Parent Report Card Lookup
    @GetMapping("/sites/{tenantId}/grades")
    public ResponseEntity<List<StudentGrade>> getGrades(
            @PathVariable Long tenantId,
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String classLevel,
            @RequestParam(required = false) String section) {
        List<StudentGrade> list;
        if (studentName != null && !studentName.trim().isEmpty()) {
            list = repository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(tenantId, studentName.trim());
        } else if (classLevel != null && !classLevel.trim().isEmpty() && section != null && !section.trim().isEmpty()) {
            list = repository.findByTenantIdAndClassLevelAndSectionOrderByCreatedAtDesc(
                    tenantId, classLevel.trim(), section.trim());
        } else {
            list = repository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        }
        return ResponseEntity.ok(list);
    }

    // Admin endpoint: Input Student Grade
    @PostMapping("/admin/sites/{tenantId}/grades")
    public ResponseEntity<StudentGrade> addGrade(
            @PathVariable Long tenantId,
            @Valid @RequestBody StudentGrade grade) {
        grade.setTenantId(tenantId);
        StudentGrade saved = repository.save(grade);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Admin endpoint: Delete Grade Record
    @DeleteMapping("/admin/grades/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
