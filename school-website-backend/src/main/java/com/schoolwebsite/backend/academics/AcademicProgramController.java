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
public class AcademicProgramController {

    private final AcademicProgramRepository repository;

    @GetMapping("/sites/{tenantId}/programs")
    public ResponseEntity<List<AcademicProgram>> getPrograms(@PathVariable Long tenantId) {
        List<AcademicProgram> list = repository.findByTenantId(tenantId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/admin/sites/{tenantId}/programs")
    public ResponseEntity<AcademicProgram> createProgram(
            @PathVariable Long tenantId,
            @Valid @RequestBody AcademicProgram program) {
        program.setTenantId(tenantId);
        AcademicProgram saved = repository.save(program);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/programs/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
