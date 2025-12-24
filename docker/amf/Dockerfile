FROM rust:1.83-alpine AS builder

WORKDIR /app

RUN apk add --no-cache \
    musl-dev \
    lksctp-tools-dev \
    pkgconfig \
    openssl-dev

COPY Cargo.toml Cargo.lock build.rs ./
COPY src ./src

RUN cargo build --release

FROM alpine:latest

RUN apk add --no-cache \
    ca-certificates \
    lksctp-tools \
    libgcc

WORKDIR /app

COPY --from=builder /app/target/release/amf /app/amf

EXPOSE 8000 38412

CMD ["/app/amf"]
