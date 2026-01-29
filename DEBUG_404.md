# 404 Troubleshooting Guide for Bhavya Events

## Quick Debugging Steps

### 1. Check Container Status

```bash
# Check if container is running
docker ps | grep bhavya-events

# Check container logs
docker logs bhavya-events -f

# Check container health
docker inspect bhavya-events | grep Health -A 10
```

### 2. Test Container Directly (Bypass Traefik)

```bash
# Get container IP
docker inspect bhavya-events | grep IPAddress

# Test health endpoint directly
curl http://CONTAINER_IP:5002/health

# Test API endpoint directly
curl http://CONTAINER_IP:5002/api/

# Test frontend directly
curl http://CONTAINER_IP:5002/
```

### 3. Check Traefik Dashboard

- Access Traefik dashboard (usually at port 8080)
- Verify services are registered:
  - `bhavya-app` service should show port 5002
  - All routers should be listed and healthy

### 4. Test DNS Resolution

```bash
# Test if domains resolve to your server
nslookup bhavya.org.in
nslookup www.bhavya.org.in
nslookup api.bhavya.org.in
```

### 5. Test with Host Headers

```bash
# Test frontend with Host header
curl -H "Host: bhavya.org.in" http://YOUR_SERVER_IP/

# Test API with Host header
curl -H "Host: api.bhavya.org.in" http://YOUR_SERVER_IP/health

# Test www variant
curl -H "Host: www.bhavya.org.in" http://YOUR_SERVER_IP/
```

## Common 404 Causes & Solutions

### 1. **Container Not Running**

```bash
# Restart container
docker restart bhavya-events

# Check startup logs
docker logs bhavya-events --tail 50
```

### 2. **Wrong Port Exposed**

- Verify container exposes port 5002
- Check `docker ps` output for port mapping

### 3. **Network Issues**

```bash
# Check if container is on dokploy-network
docker network inspect dokploy-network

# Verify container can reach other services
docker exec bhavya-events ping traefik
```

### 4. **Traefik Not Seeing Service**

- Check Traefik logs: `docker logs traefik`
- Verify labels in container: `docker inspect bhavya-events | grep traefik`

### 5. **Express Server Issues**

```bash
# Check if Express is listening on correct port
docker exec bhavya-events netstat -tlnp | grep 5002

# Test Express health endpoint
docker exec bhavya-events curl localhost:5002/health
```

## Debug Configuration

If still getting 404s, try this simplified configuration:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.test.rule=Host(`bhavya.org.in`)"
  - "traefik.http.routers.test.entrypoints=web"
  - "traefik.http.services.test.loadbalancer.server.port=5002"
```

## Expected Responses

### Health Check (should return):

```json
{
  "status": "ok",
  "timestamp": "2025-09-10T...",
  "uptime": 123,
  "environment": "production"
}
```

### Frontend Root (should return):

- React app HTML or
- API welcome message if build missing

### API Root (should return):

```json
{
  "status": "success",
  "message": "Welcome to the API",
  "version": "1.0.0"
}
```

## Contact Points for Help

If none of the above works, provide:

1. Container logs (`docker logs bhavya-events`)
2. Traefik logs (`docker logs traefik`)
3. Output of direct container test
4. Traefik dashboard screenshot
