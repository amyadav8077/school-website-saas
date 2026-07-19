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
public class AcademicCourseController {

    private final AcademicCourseRepository repository;

    @GetMapping("/sites/{tenantId}/courses")
    public ResponseEntity<List<AcademicCourse>> getCourses(@PathVariable Long tenantId) {
        List<AcademicCourse> courses = repository.findByTenantId(tenantId);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/admin/sites/{tenantId}/courses")
    public ResponseEntity<AcademicCourse> createCourse(
            @PathVariable Long tenantId,
            @Valid @RequestBody AcademicCourse course) {
        course.setTenantId(tenantId);
        AcademicCourse saved = repository.save(course);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
