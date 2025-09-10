# 🔧 Dokploy Environment Configuration

## ❌ **Current Error:**

```
MongoDB connection attempt failed: The `uri` parameter to `openUri()` must be a string, got "undefined"
```

## 🔍 **Root Cause:**

- Environment variables are not being passed to the Docker container
- `MONGODB_URI` is undefined in the runtime environment

## ✅ **Fixed in Code:**

1. **Enhanced MongoDB URI Resolution** - Now tries multiple environment variable names
2. **Added Fallback URI** - Uses hardcoded URI if environment variables fail
3. **Added Debug Logging** - Shows which environment variables are available
4. **Updated Dockerfile** - Sets both `DB_URI` and `MONGODB_URI`

## 🚀 **Dokploy Configuration Required:**

### **Environment Variables to Set in Dokploy:**

```bash
# === CORE SETTINGS ===
NODE_ENV=production
PORT=5002
APP_PORT=5002

# === DATABASE ===
MONGODB_URI=mongodb://admin:StrongPassword123@mongo-db-mongodb-avaxdz:27017/Bhavya_Events?authSource=admin
DB_URI=mongodb://admin:StrongPassword123@mongo-db-mongodb-avaxdz:27017/Bhavya_Events?authSource=admin
DATABASE_URL=mongodb://admin:StrongPassword123@mongo-db-mongodb-avaxdz:27017/Bhavya_Events?authSource=admin

# === SECURITY ===
JWT_SECRET=bhavya-events-2025-super-secure-jwt-secret-key-minimum-32-chars
JWT_EXPIRE=30d
CORS_ORIGIN=https://bhavya.org.in,https://www.bhavya.org.in

# === FRONTEND ===
FRONTEND_BUILD_PATH=/frontend/build

# === EMAIL (Optional) ===
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@bhavya.org.in

# === CLOUDINARY (Optional) ===
CLOUDINARY_CLOUD_NAME=bhavya-events-cloud
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# === PAYMENT GATEWAYS (Optional) ===
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

## 📝 **Step-by-Step Dokploy Setup:**

### **1. Container Configuration:**

- **Image Source:** GitHub (Dockerfile)
- **Repository:** `https://github.com/Deoshabh/Bhavya.git`
- **Branch:** `main`
- **Container Port:** `5002`

### **2. Environment Variables:**

Copy and paste the environment variables above into Dokploy's environment configuration section.

### **3. Health Check:**

- **Endpoint:** `/health`
- **Interval:** `30s`
- **Timeout:** `10s`
- **Retries:** `3`

### **4. Resource Limits:**

- **Memory:** `1GB`
- **CPU:** `1.0`

## 🔄 **Deployment Process:**

1. **Update Environment Variables** in Dokploy with the values above
2. **Commit and Push** the latest code changes:
   ```bash
   git add .
   git commit -m "Fix MongoDB connection with fallback URIs and debug logging"
   git push
   ```
3. **Redeploy** the application in Dokploy
4. **Check Logs** for the debug output:
   ```
   🔧 Environment Debug Info:
   - NODE_ENV: production
   - PORT: 5002
   - MONGODB_URI exists: true
   - DB_URI exists: true
   - DATABASE_URL exists: true
   ```

## 🎯 **Expected Success Output:**

```
🔧 Environment Debug Info:
- NODE_ENV: production
- PORT: 5002
- APP_PORT: 5002
- MONGODB_URI exists: true
- DB_URI exists: true
- DATABASE_URL exists: true
- CORS_ORIGIN: https://bhavya.org.in,https://www.bhavya.org.in

Attempting MongoDB connection...
Using URI pattern: mongodb://***:***@mongo-db-mongodb-avaxdz:27017/Bhavya_Events?authSource=admin
MongoDB Connected Successfully
🚀 Server running in production mode on port 5002
📡 API available at: http://localhost:5002/api
❤️  Health check: http://localhost:5002/health
```

## ⚠️ **Critical Notes:**

1. **MongoDB URI is the most important** - Make sure it matches your Dokploy MongoDB service
2. **Port must be 5002** - Container port and environment PORT should match
3. **CORS_ORIGIN** - Must include your actual domain
4. **All three database variables** - Set MONGODB_URI, DB_URI, and DATABASE_URL for maximum compatibility

## 🔧 **If Still Failing:**

Check that:

- [ ] MongoDB service is running in Dokploy
- [ ] Environment variables are properly set
- [ ] Container port is set to 5002
- [ ] MongoDB credentials are correct
- [ ] Database name is exactly `Bhavya_Events`
