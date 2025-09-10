# Dokploy 502 Error Troubleshooting Guide

## 🔍 **Current Issue:**

- Getting 502 Bad Gateway for `/favicon.ico`
- This indicates proxy can reach container but internal communication fails

## ✅ **Fixes Applied:**

1. **Added Favicon Handlers** - Server now handles `/favicon.ico` requests
2. **Port Consistency** - All files use port 5002
3. **Static File Serving** - Improved favicon and robots.txt handling

## 🛠️ **Dokploy Configuration Check:**

### **Container Port Configuration:**

- **Application Port:** 5002 (in Dockerfile: `EXPOSE 5002`)
- **Environment Variable:** `PORT=5002`
- **Server Listen Port:** Uses `process.env.APP_PORT || process.env.PORT || 5002`

### **Required Dokploy Settings:**

1. **Container Port:** `5002`
2. **Environment Variables:**
   ```bash
   NODE_ENV=production
   APP_PORT=5002
   PORT=5002
   MONGODB_URI=mongodb://admin:StrongPassword123@mongo-db-mongodb-avaxdz:27017/Bhavya_Events?authSource=admin
   CORS_ORIGIN=https://bhavya.org.in,https://www.bhavya.org.in
   JWT_SECRET=bhavya-events-2025-super-secure-jwt-secret-key-minimum-32-chars
   ```

### **Health Check URL:**

- **Internal:** `http://localhost:5002/health`
- **External:** `https://your-domain.com/health`

## 🔄 **Deployment Steps:**

1. **Commit Changes:**

   ```bash
   git add .
   git commit -m "Fix 502 error: Add favicon handlers and improve static file serving"
   git push
   ```

2. **Redeploy in Dokploy:**

   - Trigger new build
   - Check container logs for startup messages
   - Verify port binding

3. **Verify Deployment:**
   - Check `/health` endpoint returns 200
   - Test `/favicon.ico` redirects to `/favicon.webp`
   - Confirm no more 502 errors

## 🚨 **If 502 Persists:**

### **Check Container Logs:**

- Look for server startup message: `🚀 Server running in production mode on port 5002`
- Verify MongoDB connection: `MongoDB Connected Successfully`
- Check for any binding errors

### **Port Binding Issues:**

- Ensure container port in Dokploy UI is set to `5002`
- Verify no other services using port 5002
- Check if health check is passing

### **Network Issues:**

- Verify reverse proxy configuration
- Check if firewall blocking internal communication
- Ensure container can reach MongoDB service

## 📝 **Common Fixes:**

1. **Wrong Container Port** → Set to 5002 in Dokploy
2. **Environment Variables Missing** → Add all required vars
3. **Health Check Failing** → Fix endpoint or timeout settings
4. **MongoDB Connection** → Verify connection string and credentials
5. **Static Files 404** → Now handled by server routes

## ✅ **Expected Result:**

- **200 OK** for all static files
- **No 502 errors**
- **Favicon loads properly**
- **Google Analytics block is normal** (ad blockers)
