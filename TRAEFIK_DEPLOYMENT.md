# Traefik Docker Swarm Deployment Guide

## Overview

This configuration sets up Traefik routing for the Bhavya Events platform running in Docker Swarm with the following routing:

- `https://bhavya.org.in` → React Frontend (port 5002)
- `https://www.bhavya.org.in` → React Frontend (port 5002)
- `https://api.bhavya.org.in` → Express API (port 5002)

All traffic routes to the same container running on port 5002, where the Express server handles both API routes and React frontend serving.

## Traefik Configuration

### 1. Service Definition

```yaml
traefik.http.services.bhavya-app-service.loadbalancer.server.port=5002
traefik.http.services.bhavya-app-service.loadbalancer.server.scheme=http
```

### 2. Frontend Routers (React App)

```yaml
# Main domain router
traefik.http.routers.bhavya-frontend.rule=Host(`bhavya.org.in`)
traefik.http.routers.bhavya-frontend.service=bhavya-app-service
traefik.http.routers.bhavya-frontend.tls.certresolver=letsencrypt

# WWW subdomain router
traefik.http.routers.bhavya-frontend-www.rule=Host(`www.bhavya.org.in`)
traefik.http.routers.bhavya-frontend-www.service=bhavya-app-service
traefik.http.routers.bhavya-frontend-www.tls.certresolver=letsencrypt
```

### 3. API Router (Express API)

```yaml
# API subdomain router
traefik.http.routers.bhavya-api.rule=Host(`api.bhavya.org.in`)
traefik.http.routers.bhavya-api.service=bhavya-app-service
traefik.http.routers.bhavya-api.tls.certresolver=letsencrypt
```

## Key Features

### ✅ Single Container Service

- All three domains route to the same container on port 5002
- Express server handles routing internally:
  - API routes: `/api/*` → Express API handlers
  - Frontend routes: `/*` → React SPA with client-side routing

### ✅ TLS with Let's Encrypt

- Automatic SSL certificates for all domains
- HTTP to HTTPS redirects configured
- Security headers applied

### ✅ Proper Service Binding

- Explicit `traefik.http.routers.<name>.service` assignments
- Single service definition shared across routers
- Proper load balancer configuration

### ✅ Docker Swarm Network

- Uses `dokploy-network` overlay network
- External network for cross-service communication

## Deployment Steps

### 1. Deploy the Stack

```bash
docker stack deploy -c docker-compose.swarm.yml bhavya-events
```

### 2. Verify Services

```bash
# Check stack status
docker stack services bhavya-events

# Check container logs
docker service logs bhavya-events_app -f
```

### 3. Test Routing

```bash
# Test API endpoint
curl -H "Host: api.bhavya.org.in" http://localhost/health

# Test frontend
curl -H "Host: bhavya.org.in" http://localhost/

# Test www redirect
curl -H "Host: www.bhavya.org.in" http://localhost/
```

## DNS Configuration Required

Make sure your DNS records point to your Dokploy server:

```
A    bhavya.org.in      → YOUR_SERVER_IP
A    www.bhavya.org.in  → YOUR_SERVER_IP
A    api.bhavya.org.in  → YOUR_SERVER_IP
```

## Troubleshooting

### Check Traefik Dashboard

Access the Traefik dashboard to verify:

- All routers are registered
- Services are healthy
- Certificates are issued

### Verify Container Health

```bash
# Check health status
docker service ps bhavya-events_app

# Check container logs for CORS and routing
docker service logs bhavya-events_app --tail 100
```

### Common Issues

1. **503 Service Unavailable**

   - Check if container is running: `docker service ls`
   - Verify health check endpoint: `curl http://container:5002/health`

2. **Certificate Issues**

   - Ensure domains point to your server
   - Check Traefik logs for ACME challenges
   - Verify Let's Encrypt rate limits

3. **CORS Errors**
   - Server is configured to allow the specified domains
   - Check server logs for CORS rejection messages

## Express Server Configuration

The Express server (backend/server.js) is configured to:

1. **Serve API routes** at `/api/*` paths
2. **Serve React frontend** for all other paths with SPA fallback
3. **Handle CORS** for the specified domains
4. **Trust proxy headers** for proper client IP detection behind Traefik

This allows a single container to handle both frontend and API traffic seamlessly.
