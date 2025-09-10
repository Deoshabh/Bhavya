# Dokploy Deployment Guide for Bhavya Events Platform

## Prerequisites

1. Dokploy instance running with Docker support
2. Domain name configured (e.g., bhavya.org.in)
3. MongoDB service available (you provided the connection string)
4. SSL certificates configured

## Deployment Steps

### 1. Environment Variables

Configure the following environment variables in Dokploy:

#### Required Environment Variables

```bash
# Application Settings
NODE_ENV=production
PORT=5001
FRONTEND_BUILD_PATH=/frontend/build

# Database
DB_URI=mongodb://admin:StrongPassword123@mongo-db-mongodb-avaxdz:27017/bhavya_Events?authSource=admin

# Security
JWT_SECRET=your-super-secure-jwt-secret-here-min-32-chars
CORS_ORIGIN=https://bhavya.org.in,https://www.bhavya.org.in

# Email Configuration (Update with your email service)
EMAIL_FROM=noreply@bhavya.org.in
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Optional Environment Variables

```bash
# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Redis (if using for sessions/caching)
REDIS_URL=redis://localhost:6379
```

### 2. Docker Configuration

The Dockerfile is optimized for production deployment with:

- Multi-stage build for smaller final image
- Non-root user for security
- Health checks
- Proper signal handling with dumb-init
- Alpine Linux base for smaller footprint

### 3. Volume Mounts

Configure the following volumes in Dokploy:

```bash
# For uploaded files (persistent storage)
/app/uploads:/path/to/persistent/uploads

# For application logs
/app/logs:/path/to/persistent/logs
```

### 4. Port Configuration

- **Container Port**: 5001
- **Host Port**: Configure as needed (typically 80/443 with reverse proxy)

### 5. Health Check

The application includes a health check endpoint at `/health` that returns:

```json
{
  "status": "UP",
  "timestamp": "2025-09-10T12:00:00.000Z",
  "uptime": 3600
}
```

### 6. SSL/TLS Configuration

Configure your reverse proxy (nginx/traefik) to handle SSL termination:

```nginx
server {
    listen 443 ssl;
    server_name bhavya.org.in www.bhavya.org.in;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7. Database Migration

If you need to run database seeders or migrations:

```bash
# Connect to the container
docker exec -it <container-name> sh

# Run database seeding (if needed)
npm run seed-data

# Create admin user (if needed)
npm run create-admin
```

### 8. Monitoring and Logs

Monitor the application using:

```bash
# View application logs
docker logs -f <container-name>

# Check health status
curl https://bhavya.org.in/health

# Monitor resource usage
docker stats <container-name>
```

### 9. Backup Strategy

#### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb://admin:StrongPassword123@mongo-db-mongodb-avaxdz:27017/bhavya_Events?authSource=admin" --out=/backup/$(date +%Y%m%d)
```

#### File Uploads Backup

```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz /path/to/persistent/uploads
```

### 10. Scaling Considerations

For high traffic, consider:

- Multiple container instances behind a load balancer
- Redis for session storage and caching
- CDN for static assets
- Database read replicas

### 11. Security Checklist

- ✅ Non-root user in container
- ✅ Environment variables for secrets
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Input validation and sanitization
- ✅ Security headers (helmet.js)
- ✅ HTTPS enforced

### 12. Troubleshooting

#### Common Issues:

1. **Frontend not loading**: Check FRONTEND_BUILD_PATH environment variable
2. **Database connection issues**: Verify DB_URI and network connectivity
3. **CORS errors**: Update CORS_ORIGIN with your domain
4. **File upload issues**: Ensure uploads volume is properly mounted

#### Debug Commands:

```bash
# Check container health
docker inspect <container-name> | grep Health

# View environment variables
docker exec <container-name> printenv

# Check file permissions
docker exec <container-name> ls -la /app/uploads
```

## Production Checklist

- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Volumes mounted for persistent data
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Health checks working
- [ ] CORS origins updated
- [ ] Rate limiting configured
- [ ] Security headers enabled

## Support

For deployment issues, check:

1. Application logs in Dokploy
2. Health endpoint: `https://yourdomain.com/health`
3. MongoDB connectivity
4. Environment variable configuration
