# ===============================================
# Multi-stage Dockerfile for Dokploy Deployment
# ===============================================

# Build stage for frontend
FROM node:18-alpine AS frontend-build

# Set working directory
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# ===============================================
# Production stage
# ===============================================
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and set ownership
RUN mkdir -p /app /frontend/build /app/logs /app/uploads && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy backend source code
COPY backend/ ./

# Copy built frontend from build stage
COPY --from=frontend-build /app/frontend/build /frontend/build

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=5001
ENV FRONTEND_BUILD_PATH=/frontend/build

# Default MongoDB connection (can be overridden via environment variables)
ENV DB_URI=mongodb://admin:StrongPassword123@mongo-db-mongodb-avaxdz:27017/bhavya_Events?authSource=admin

# Security and optimization settings
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_PROGRESS=false

# Create necessary directories and set proper permissions
RUN mkdir -p /app/uploads/admin /app/uploads/events /app/uploads/profiles && \
    chown -R nodejs:nodejs /app /frontend && \
    chmod -R 755 /app/uploads

# Switch to non-root user for security
USER nodejs

# Expose the application port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5001/health', (res) => { \
    res.statusCode === 200 ? process.exit(0) : process.exit(1) \
    }).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
