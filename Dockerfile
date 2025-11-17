# syntax=docker/dockerfile:1

ARG RUST_VERSION=1.83
ARG APP_NAME=helper-chatbot

################################################################################
# Build stage
################################################################################
FROM rust:${RUST_VERSION}-slim-bookworm AS builder
ARG APP_NAME
WORKDIR /app

# Install build dependencies (for reqwest/native-tls -> OpenSSL)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        pkg-config \
        libssl-dev \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Cache dependencies by compiling with a dummy main first
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src target/release

# Copy source and assets
COPY src ./src
COPY static ./static

# Build the real application
RUN cargo build --release --bin ${APP_NAME}

################################################################################
# Runtime stage
################################################################################
FROM debian:bookworm-slim AS runtime

# Only the runtime bits we need
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        libssl3 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy compiled binary and static assets
ARG APP_NAME=helper-chatbot
COPY --from=builder /app/target/release/${APP_NAME} /app/chatbot
COPY static ./static

ENV RUST_LOG=info
ENV PORT=8080

EXPOSE 8080
CMD ["/app/chatbot"]
