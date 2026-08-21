package com.schoolwebsite.backend.firebase;

import java.io.FileInputStream;
import java.io.InputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;

import lombok.extern.slf4j.Slf4j;

/**
 * Initializes the Firebase Admin SDK, but ONLY when {@code firebase.enabled=true}
 * and a service-account credential file is provided. This keeps the app runnable
 * in local/dev without Firebase configured — phone-OTP login simply stays
 * disabled until credentials are dropped in.
 *
 * <p>To enable:
 * <ol>
 *   <li>Create a Firebase project, enable Phone Authentication.</li>
 *   <li>Download a service-account JSON (Project settings → Service accounts).</li>
 *   <li>Set env vars: {@code FIREBASE_ENABLED=true},
 *       {@code FIREBASE_SERVICE_ACCOUNT_PATH=/abs/path/service-account.json}.</li>
 * </ol>
 */
@Slf4j
@Configuration
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true")
public class FirebaseConfig {

    @Value("${firebase.service-account-path:}")
    private String serviceAccountPath;

    @Bean
    public FirebaseAuth firebaseAuth() throws Exception {
        if (serviceAccountPath == null || serviceAccountPath.isBlank()) {
            throw new IllegalStateException("firebase.enabled=true but firebase.service-account-path is not set. "
                    + "Provide FIREBASE_SERVICE_ACCOUNT_PATH pointing to the service-account JSON.");
        }

        FirebaseApp app;
        if (FirebaseApp.getApps().isEmpty()) {
            try (InputStream credentials = new FileInputStream(serviceAccountPath)) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(credentials)).build();
                app = FirebaseApp.initializeApp(options);
                log.info("Firebase Admin SDK initialized from {}", serviceAccountPath);
            }
        } else {
            app = FirebaseApp.getInstance();
        }
        return FirebaseAuth.getInstance(app);
    }
}
