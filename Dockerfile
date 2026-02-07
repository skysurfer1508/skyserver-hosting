# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - use Node to run preview server
FROM node:20-alpine AS production

WORKDIR /app

# Copy built assets and package files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port 7012
EXPOSE 7012

# Health check on port 7012
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:7012 || exit 1

# Start the preview server on port 7012
CMD ["npm", "run", "preview", "--", "--port", "7012", "--host"]
