@echo off
echo Setting up Firebase configuration...
echo.

echo Please follow these steps:
echo 1. Go to https://console.firebase.google.com/
echo 2. Select your project
echo 3. Click the gear icon (Project Settings)
echo 4. Scroll down to "Your apps" section
echo 5. Copy the configuration values
echo.

echo Creating .env file...
echo # Firebase Configuration > .env
echo REACT_APP_FIREBASE_API_KEY=your_api_key_here >> .env
echo REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com >> .env
echo REACT_APP_FIREBASE_PROJECT_ID=your_project_id >> .env
echo REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com >> .env
echo REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id >> .env
echo REACT_APP_FIREBASE_APP_ID=your_app_id >> .env

echo.
echo .env file created! Now:
echo 1. Edit the .env file and replace the placeholder values with your actual Firebase config
echo 2. Restart your development server
echo.
pause
