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
public class BoardResultController {

    private final BoardResultRepository repository;

    @GetMapping("/sites/{tenantId}/board-results")
    public ResponseEntity<List<BoardResult>> getBoardResults(@PathVariable Long tenantId) {
        List<BoardResult> list = repository.findByTenantId(tenantId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/admin/sites/{tenantId}/board-results")
    public ResponseEntity<BoardResult> createBoardResult(
            @PathVariable Long tenantId,
            @Valid @RequestBody BoardResult result) {
        result.setTenantId(tenantId);
        BoardResult saved = repository.save(result);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/board-results/{id}")
    public ResponseEntity<Void> deleteBoardResult(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
