package com.schoolwebsite.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class SchoolWebsiteBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SchoolWebsiteBackendApplication.class, args);
    }
}
