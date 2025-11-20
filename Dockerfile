ARG RUST_VERSION=1.83
ARG APP_NAME=helper-chatbot


# Build stage

FROM rust:${RUST_VERSION}-slim-bookworm AS builder

ARG APP_NAME
RUN echo "Building ${APP_NAME} with Rust ${RUST_VERSION}"

WORKDIR /app

#install build dependencies (for reqwest/native-tls -> OpenSSL)

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        pkg-config \
        libssl-dev && \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*



# cache dependencies by compiling with a dummy main first

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src target/release



# Copy source code
COPY src ./src
COPY static ./static

# Build the application
RUN cargo build --release --bin ${APP_NAME}

#########################################################
# Runtime stage
#########################################################

FROM debian:bookworm-slim AS runtime

# Install required runtime dependencies
RUN apt-get update && \
    apt-get install -y ca-certificates libssl3 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy compiled binary and static files
ARG APP_NAME=helper-chatbot

COPY --from=builder /app/target/release/${APP_NAME} /app/chatbot
COPY static ./static

# Note: .env file is NOT copied - use environment variables from docker-compose
# Set default environment variables
ENV RUST_LOG=info
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Run the binary
CMD ["/app/chatbot"]