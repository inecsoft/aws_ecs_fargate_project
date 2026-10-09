# ==============================================================================
# Multi-stage Dockerfile for Rust ECS Services
# ==============================================================================
# Build with: docker build --build-arg SERVICE_NAME=service-a -t service-a .
# ==============================================================================

# ── Arguments ────────────────────────────────────────────────────────────────
ARG SERVICE_NAME=service-b

# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM rust:1.75-slim-bookworm AS builder

ARG SERVICE_NAME

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy manifests first for better layer caching
COPY services/${SERVICE_NAME}/Cargo.toml services/${SERVICE_NAME}/Cargo.lock ./

# Create dummy main for dependency caching
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Copy actual source code
COPY services/${SERVICE_NAME}/src ./src

# Build the release binary
RUN cargo build --release && \
    strip target/release/${SERVICE_NAME}

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM debian:bookworm-slim AS runtime

ARG SERVICE_NAME

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -m appuser

WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/target/release/${SERVICE_NAME} /app/server

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Run the binary
ENTRYPOINT ["/app/server"]
