# Stage 1: Build the Angular Server-Side Rendered (SSR) bundle
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency mappings
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy source code and compile the production SSR application
COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Create a minimal Node.js server container
FROM node:20-alpine AS runner
WORKDIR /app

# Copy the compiled production build from the builder stage
COPY --from=builder /app/dist/school-website-frontend ./dist/school-website-frontend

# Expose port 4000 (standard port for serving Angular SSR)
EXPOSE 4000

# Set environment node variables and run the compiled server script
ENV PORT=4000
CMD ["node", "dist/school-website-frontend/server/server.mjs"]
