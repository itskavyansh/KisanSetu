# 🚀 Fix Guide for KisanSetu

## ❌ **Issues Found:**
1. **Client**: TypeScript version conflict with react-scripts@5.0.1
2. **Server**: Gemini API integration not working properly

## 🔧 **Fix 1: Client Dependencies**

### Step 1: Fix TypeScript Version
```bash
cd client
npm install --legacy-peer-deps
```

**OR** (if that doesn't work):
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Step 2: Verify Client Works
```bash
cd client
npm start
```

## 🔧 **Fix 2: Server Dependencies**

### Step 1: Install node-fetch
```bash
cd server
npm install node-fetch@2
```

### Step 2: Create .env file
```bash
cd server
# Create .env file with:
GOOGLE_API_KEY=AIzaSyAnEATv0YIS1e9Zt9oKKkjm13w8CzViJuY
PORT=5000
NODE_ENV=development
```

### Step 3: Test Server Setup
```bash
cd server
node quick-test.js
```

### Step 4: Start Server
```bash
cd server
npm start
```

## 🧪 **Testing the Fixes**

### Test 1: Basic Connectivity
```bash
curl http://localhost:5000/health
```

### Test 2: Gemini API
```bash
curl http://localhost:5000/api/crop-health/test-gemini
```

### Test 3: Image Processing
```bash
curl http://localhost:5000/api/crop-health/test-image
```

## 🎯 **Expected Results**

- ✅ **Client**: Should start without TypeScript errors
- ✅ **Server**: Should start and show Gemini configuration
- ✅ **Gemini API**: Should respond to test requests
- ✅ **Image Analysis**: Should process images and return real analysis

## 🚨 **If Still Having Issues**

### Check 1: API Key
- Verify the API key is correct
- Check if Gemini API is enabled in Google Cloud

### Check 2: Dependencies
- Ensure node-fetch@2 is installed
- Check if all packages are properly installed

### Check 3: Environment
- Verify .env file exists in server directory
- Check if GOOGLE_API_KEY is set

## 📞 **Quick Commands**

```bash
# Fix client
cd client && npm install --legacy-peer-deps

# Fix server
cd server && npm install node-fetch@2

# Test everything
cd server && node quick-test.js
```

## 🎉 **Success Indicators**

- Client starts without errors
- Server shows "Gemini model configured with API key"
- Test endpoints return successful responses
- Image uploads get real analysis instead of generic text
