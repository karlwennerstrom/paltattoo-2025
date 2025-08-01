# Multi-stage build para React
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clear all caches and install fresh
RUN rm -rf node_modules package-lock.json && \
    npm cache clean --force && \
    npm config delete cache && \
    npm install --legacy-peer-deps --no-optional

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV CI=false

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve@14.2.1

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 8080

# Start the application
CMD ["sh", "-c", "serve -s build -p ${PORT:-8080}"]