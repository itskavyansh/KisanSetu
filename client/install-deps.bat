@echo off
echo 🔧 Installing missing dependencies for KisanSetu Client...

echo 🧹 Cleaning existing dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 📦 Installing dependencies...
npm install --legacy-peer-deps

echo 🔍 Installing specific missing packages...
npm install --legacy-peer-deps react-i18next@13.5.0 i18next@23.7.0 recharts@2.8.0

echo 🎨 Installing Tailwind CSS and related packages...
npm install --legacy-peer-deps @tailwindcss/forms@0.5.7 tailwindcss@3.3.6 postcss@8.4.32 autoprefixer@10.4.16

echo ✅ Dependencies installed successfully!
echo 🚀 You can now run: npm start
pause
