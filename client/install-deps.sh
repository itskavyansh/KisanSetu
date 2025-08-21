#!/bin/bash

echo "🔧 Installing missing dependencies for KisanSetu Client..."

# Remove existing node_modules and package-lock.json
echo "🧹 Cleaning existing dependencies..."
rm -rf node_modules package-lock.json

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Install specific missing packages
echo "🔍 Installing specific missing packages..."
npm install --legacy-peer-deps react-i18next@13.5.0 i18next@23.7.0 recharts@2.8.0

# Install Tailwind CSS and related packages
echo "🎨 Installing Tailwind CSS and related packages..."
npm install --legacy-peer-deps @tailwindcss/forms@0.5.7 tailwindcss@3.3.6 postcss@8.4.32 autoprefixer@10.4.16

echo "✅ Dependencies installed successfully!"
echo "🚀 You can now run: npm start"
