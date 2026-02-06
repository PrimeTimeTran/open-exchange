FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install protoc and protobuf-dev if you need to generate protos during build
# Ideally you generate them before or use a multi-stage that handles generation
RUN apk add --no-cache protobuf-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the server
RUN go build -o server_bin ./cmd/server

# Build the backfill tool
RUN go build -o backfill_bin ./cmd/backfill

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server_bin .
COPY --from=builder /app/backfill_bin .

EXPOSE 50053

CMD ["./server_bin"]
