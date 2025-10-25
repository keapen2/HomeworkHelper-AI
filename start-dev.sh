#!/bin/bash

# Homework Helper AI - Development Startup Script

echo "🚀 Starting Homework Helper AI Development Environment"
echo ""

# Check if .env files exist
echo "📋 Checking environment configuration..."

if [ ! -f "server/.env" ]; then
    echo "⚠️  Server .env file not found. Creating from template..."
    cp server/env.example server/.env
    echo "📝 Please edit server/.env with your configuration"
fi

if [ ! -f "client-mobile/.env" ]; then
    echo "⚠️  Mobile .env file not found. Creating from template..."
    cp client-mobile/env.example client-mobile/.env
    echo "📝 Please edit client-mobile/.env with your configuration"
fi

if [ ! -f "client-admin/.env" ]; then
    echo "⚠️  Admin .env file not found. Creating from template..."
    echo "VITE_API_BASE_URL=http://localhost:5000" > client-admin/.env
    echo "📝 Please edit client-admin/.env with your configuration"
fi

echo ""
echo "🔧 Available development commands:"
echo ""
echo "  Backend + Admin Dashboard:"
echo "    npm run dev"
echo ""
echo "  Mobile App (separate terminal):"
echo "    npm run dev:mobile"
echo ""
echo "  Individual services:"
echo "    npm run dev:server    # Backend API only"
echo "    npm run dev:admin     # Admin dashboard only"
echo ""
echo "📱 Mobile App Setup:"
echo "  1. Install Expo CLI: npm install -g @expo/cli"
echo "  2. Install Expo Go app on your phone"
echo "  3. Run: npm run dev:mobile"
echo "  4. Scan QR code with Expo Go"
echo ""
echo "🌐 Web Access:"
echo "  - Backend API: http://localhost:5000"
echo "  - Admin Dashboard: http://localhost:3000"
echo "  - API Health Check: http://localhost:5000/health"
echo ""
echo "📚 Next Steps:"
echo "  1. Configure your .env files with API keys"
echo "  2. Start the backend: npm run dev:server"
echo "  3. Start the admin dashboard: npm run dev:admin"
echo "  4. Start the mobile app: npm run dev:mobile"
echo ""
echo "✅ Ready to start development!"
