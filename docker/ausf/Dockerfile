FROM rust:1.82 AS builder

WORKDIR /app

COPY Cargo.toml ./

RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src

COPY . .

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/ausf /app/ausf

EXPOSE 8080

CMD ["./ausf"]
