# Stage 1: Build the Spring Boot executable JAR
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Copy gradle wrapper and configurations
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Grant execute permission for the wrapper and download dependencies
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# Copy source code and build the JAR (skipping unit tests for packaging)
COPY src src
RUN ./gradlew bootJar -x test --no-daemon

# Stage 2: Create a minimal, lightweight JRE runtime container
FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose port 8080 and launch the server
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
