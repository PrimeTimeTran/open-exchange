FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install protoc and protobuf-dev
RUN apk add --no-cache protobuf-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the server
RUN go build -o server_bin ./cmd/server

# Build the client (optional, but good to have)
# RUN go build -o client_bin ./cmd/client

FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache ca-certificates

COPY --from=builder /app/server_bin .
# COPY --from=builder /app/client_bin .

EXPOSE 50051

CMD ["./server_bin"]
