FROM node:20-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM golang:1.24-alpine AS backend
WORKDIR /app
COPY go.mod ./
COPY main.go ./
COPY --from=frontend /app/dist ./dist
RUN go build -o server .

FROM alpine:3.20
WORKDIR /app
RUN apk add --no-cache ca-certificates
COPY --from=backend /app/server ./server
COPY --from=backend /app/dist ./dist
ENV PORT=8080
EXPOSE 8080
CMD ["./server"]
