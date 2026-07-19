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
public class StudentAchieverController {

    private final StudentAchieverRepository repository;

    @GetMapping("/sites/{tenantId}/achievers")
    public ResponseEntity<List<StudentAchiever>> getAchievers(@PathVariable Long tenantId) {
        List<StudentAchiever> list = repository.findByTenantId(tenantId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/admin/sites/{tenantId}/achievers")
    public ResponseEntity<StudentAchiever> createAchiever(
            @PathVariable Long tenantId,
            @Valid @RequestBody StudentAchiever achiever) {
        achiever.setTenantId(tenantId);
        StudentAchiever saved = repository.save(achiever);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/achievers/{id}")
    public ResponseEntity<Void> deleteAchiever(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
