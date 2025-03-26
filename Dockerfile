# Build stage for frontend
FROM node:16 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:16-slim
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Copy built frontend from build stage
COPY --from=frontend-build /app/frontend/build /frontend/build

# Environment variables
ENV NODE_ENV=production
ENV PORT=5001
ENV FRONTEND_BUILD_PATH=/frontend/build

# Set proper ownership
RUN chown -R node:node /app /frontend

# Switch to non-root user
USER node

# Expose port and start application
EXPOSE 5001
CMD ["npm", "start"]
