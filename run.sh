#!/bin/bash

echo "🚀 Booting up AI Document Hub..."

# Trap to kill all background processes when you press Ctrl+C
trap 'echo "🛑 Shutting down servers..."; kill $(jobs -p); exit' SIGINT SIGTERM EXIT

# 1. Install Dependencies
echo "📦 Checking Backend Dependencies..."
cd backend && npm install
cd ..

echo "📦 Checking Mobile Dependencies..."
cd mobile && npm install
cd ..

# 2. Start Backend Server in the background
echo "⚡ Starting NestJS Backend..."
cd backend && npm run start:dev &

# 3. Start Frontend Server in the background
echo "📱 Starting Expo Web Bundler..."
cd mobile && npx expo start --web &

# Wait for both processes to finish (keeps script running)
wait