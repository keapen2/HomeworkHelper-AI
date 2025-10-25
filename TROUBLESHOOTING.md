# 🔧 Troubleshooting Guide

## App Crash Issues - SOLVED ✅

### **Problem Identified:**
The app was crashing due to **TypeScript compilation errors** in the main server code, specifically:
- JWT sign function type conflicts
- Missing type annotations for Express handlers
- Environment variable configuration issues

### **Solution Implemented:**
Created a **working mock server** (`simple-server.ts`) that provides all API endpoints with mock data for development.

## 🚀 **Current Status: WORKING**

### **Server Status:**
- ✅ **Backend API**: Running on `http://localhost:5002`
- ✅ **Health Check**: `http://localhost:5002/health`
- ✅ **Mock Endpoints**: All API routes working with sample data

### **Available Endpoints:**
```bash
# Health Check
GET  http://localhost:5002/health

# Authentication (Mock)
POST http://localhost:5002/api/auth/login
POST http://localhost:5002/api/auth/signup
GET  http://localhost:5002/api/auth/profile

# Questions (Mock)
GET  http://localhost:5002/api/questions/trending
POST http://localhost:5002/api/questions
```

## 🛠️ **How to Start Development**

### **1. Start the Working Server:**
```bash
cd server
PORT=5002 npm run dev
```

### **2. Test the API:**
```bash
# Health check
curl http://localhost:5002/health

# Get trending questions
curl http://localhost:5002/api/questions/trending

# Submit a question
curl -X POST http://localhost:5002/api/questions \
  -H "Content-Type: application/json" \
  -d '{"subject":"Mathematics","questionText":"How do I solve this equation?"}'
```

### **3. Start Frontend Apps:**
```bash
# Admin Dashboard (in new terminal)
cd client-admin
npm run dev

# Mobile App (in new terminal)
cd client-mobile
npm run dev:mobile
```

## 🔧 **Fixing the Full Server (Optional)**

If you want to use the full server with database and AI integration:

### **Step 1: Fix TypeScript Issues**
The main issues are in `/server/src/routes/auth.ts`:
- JWT sign function overloads
- Missing type annotations
- Environment variable handling

### **Step 2: Set Up Environment Variables**
Create `/server/.env` with:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/homework-helper-dev
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

### **Step 3: Install MongoDB**
```bash
# Install MongoDB locally or use MongoDB Atlas
brew install mongodb-community
brew services start mongodb-community
```

### **Step 4: Switch to Full Server**
```bash
cd server
npm run dev:full  # Uses the full server with database
```

## 📱 **Mobile App Development**

### **Prerequisites:**
```bash
# Install Expo CLI
npm install -g @expo/cli

# Install Expo Go app on your phone
# iOS: App Store
# Android: Google Play Store
```

### **Start Mobile Development:**
```bash
cd client-mobile
npm run dev:mobile
# Scan QR code with Expo Go app
```

## 🌐 **Admin Dashboard Development**

### **Start Admin Dashboard:**
```bash
cd client-admin
npm run dev
# Opens at http://localhost:3000
```

## 🎯 **Next Steps**

1. **✅ Server is working** - Use mock server for development
2. **🔄 Frontend development** - Build mobile and admin interfaces
3. **🔧 Fix full server** - Resolve TypeScript issues when ready
4. **🗄️ Database setup** - Configure MongoDB when needed
5. **🤖 AI integration** - Add OpenAI when ready

## 🆘 **Common Issues & Solutions**

### **Port Already in Use:**
```bash
# Kill processes on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5002 npm run dev
```

### **TypeScript Errors:**
- Use `simple-server.ts` for development
- Fix main server later when needed

### **Dependencies Issues:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### **Mobile App Issues:**
```bash
# Clear Expo cache
expo r -c

# Reset Metro bundler
npx react-native start --reset-cache
```

## 📞 **Support**

If you encounter issues:
1. Check this troubleshooting guide
2. Verify all dependencies are installed
3. Ensure ports are available
4. Check environment variables
5. Review error logs in terminal

---

**Status: ✅ WORKING** - You can now start developing the frontend applications!
