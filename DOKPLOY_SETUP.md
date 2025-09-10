# Dokploy Traefik Setup Guide

## Quick Setup for Dokploy

### 1. DNS Configuration

First, set up your DNS records to point to your Dokploy server:

```
A    bhavya.org.in      → YOUR_DOKPLOY_SERVER_IP
A    www.bhavya.org.in  → YOUR_DOKPLOY_SERVER_IP
A    api.bhavya.org.in  → YOUR_DOKPLOY_SERVER_IP
```

### 2. Copy Traefik Labels

In your Dokploy service configuration, copy and paste all the labels from `dokploy-traefik-labels.txt`:

```
traefik.enable=true
traefik.http.routers.bhavya-frontend.rule=Host(`bhavya.org.in`)
... (copy all labels from the file)
```

### 3. Service Configuration

- **Container Port**: 5002
- **Network**: dokploy-network (or your Dokploy network)
- **Environment Variables**: Set your MongoDB URI and other config

### 4. How It Works

#### Domain Routing:

- `https://bhavya.org.in` → React Frontend (Express serves SPA)
- `https://www.bhavya.org.in` → React Frontend (Express serves SPA)
- `https://api.bhavya.org.in` → Express API routes

#### Express Server Handling:

- **API requests** to `api.bhavya.org.in` → Express routes under `/api/*`
- **Frontend requests** to main domains → Express serves React build + SPA routing
- **Same container, same port (5002)** handles everything

### 5. Key Features

✅ **Single Container**: One container serves both frontend and API  
✅ **TLS/SSL**: Automatic Let's Encrypt certificates  
✅ **HTTP→HTTPS**: Automatic redirects  
✅ **Security Headers**: HSTS and secure headers applied  
✅ **Service Binding**: Explicit router → service assignments

### 6. Testing After Deployment

```bash
# Test API health check
curl https://api.bhavya.org.in/health

# Test frontend
curl https://bhavya.org.in/

# Test www redirect
curl https://www.bhavya.org.in/
```

### 7. Troubleshooting

**503 Service Unavailable:**

- Check if container is running and healthy
- Verify port 5002 is exposed
- Check Traefik dashboard for service registration

**Certificate Issues:**

- Ensure DNS propagation is complete
- Check Let's Encrypt rate limits
- Verify domain ownership

**CORS Errors:**

- Server is configured for your domains
- Check server logs for CORS messages
