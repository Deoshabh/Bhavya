# Deployment Environment Variables

## Critical Environment Variables for Production

### CORS Configuration

Set these environment variables in your Dokploy deployment:

```bash
# Allow frontend domain to access API
CORS_ORIGIN=https://bhavya.org.in,https://www.bhavya.org.in,https://api.bhavya.org.in

# Node environment
NODE_ENV=production

# Frontend URL for email links and redirects
FRONTEND_URL=https://bhavya.org.in
```

### WebSocket Configuration (Optional)

If you're using WebSockets, set:

```bash
# WebSocket URL for frontend
REACT_APP_WS_URL=wss://api.bhavya.org.in/ws
```

### API Configuration for Frontend Build

The frontend needs to know the API URL during build time:

```bash
REACT_APP_API_URL=https://api.bhavya.org.in/api
```

## Dokploy Deployment Steps

1. **Set Environment Variables**
   - Go to your Dokploy dashboard
   - Navigate to your backend service
   - Add the environment variables listed above

2. **Redeploy Backend**
   - After setting the environment variables
   - Trigger a redeploy of your backend service
   - The new CORS configuration will take effect

3. **Verify CORS Headers**
   - Check browser console for CORS errors
   - Should see `Access-Control-Allow-Origin: https://bhavya.org.in` in response headers

## Troubleshooting

### CORS Still Not Working?

1. **Check Traefik/Proxy Configuration**
   - Ensure your reverse proxy isn't stripping CORS headers
   - Check Traefik middleware configuration

2. **Verify Environment Variables Are Set**

   ```bash
   # In your backend container
   echo $CORS_ORIGIN
   ```

3. **Check Backend Logs**
   - Look for "CORS: Blocked request from origin" messages
   - Verify which origin is being received

### WebSocket Issues

If WebSocket connections fail:

1. **Check WebSocket URL Format**
   - Should be `wss://` for HTTPS sites
   - Should point to your API domain: `wss://api.bhavya.org.in/ws`

2. **Verify WebSocket Support**
   - Ensure your proxy (Traefik) supports WebSocket upgrades
   - Check for `Upgrade: websocket` headers

3. **Backend WebSocket Server**
   - Verify if your backend actually implements WebSocket server
   - Check if WebSocket routes are configured

## Current Status

✅ CORS configuration updated in `backend/server.js`
✅ Supports multiple origins including frontend and API domains
✅ Includes credentials support for authenticated requests
⚠️ Environment variables need to be set in Dokploy
⚠️ Backend needs to be redeployed after setting env vars

## Next Steps

1. Set `CORS_ORIGIN` environment variable in Dokploy
2. Redeploy backend service
3. Test API requests from frontend
4. Monitor browser console for errors
