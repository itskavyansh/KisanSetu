# 🌾 KisanSetu - AI-Powered Farmer Assistant

A comprehensive digital platform that empowers farmers with AI-driven crop health monitoring, market intelligence, government scheme navigation, and carbon credit opportunities.

## ✨ Features

### 🚀 Core Features
- **Crop Health Scanner**: AI-powered disease detection using Google Vertex AI
- **Market Intelligence**: Real-time mandi prices and market trends
- **Government Schemes**: Easy navigation through subsidies and schemes
- **Carbon Credits**: MRV system for earning from climate finance
- **Voice Interface**: Local language support (Kannada, Hindi, English)
- **Authentication**: Secure Firebase-based user management

### 🔧 Technical Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js
- **AI**: Google Vertex AI (Gemini models)
- **Database**: Firebase (Authentication + Firestore)
- **Authentication**: Firebase Auth with protected routes

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Google Cloud Project (for Vertex AI)
- Firebase Project (for authentication)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd KisanSetu

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Setup

#### Backend (.env)
Create `server/.env`:
```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./src/serviceAccountKey.json

# Vertex AI Configuration
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL_NAME=gemini-1.5-flash

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Frontend Firebase Config
Update `client/src/config/firebase.ts` with your Firebase project details:
```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Google Cloud Setup

1. **Create a Google Cloud Project**
2. **Enable Vertex AI API**
3. **Create a Service Account** with Vertex AI User role
4. **Download the JSON key** and save as `server/src/serviceAccountKey.json`

### 4. Firebase Setup

1. **Create a Firebase Project**
2. **Enable Authentication** (Email/Password)
3. **Copy the config** to `client/src/config/firebase.ts`

### 5. Run the Application

```bash
# Terminal 1: Start Backend
cd server
npm start

# Terminal 2: Start Frontend
cd client
npm start
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🧪 Testing the Integration

### 1. **Authentication Flow**
- Visit http://localhost:3000 → Redirects to /login
- Create account → Redirects to /dashboard
- All routes are protected

### 2. **Crop Health Scanner**
- Navigate to /scan-crop
- Upload a crop image
- Select crop type
- Get AI analysis (mock data for now)

### 3. **Market Intelligence**
- Navigate to /market
- Select different crops
- View prices and trends
- Get selling recommendations

### 4. **Government Schemes**
- Navigate to /schemes
- Browse available schemes
- Check eligibility
- Get application guidance

### 5. **Carbon Credits**
- Navigate to /carbon-credits
- Calculate potential earnings
- View market prices
- Join programs

## 🔄 API Endpoints

### Crop Health
- `POST /api/crop-health/analyze` - Analyze crop image
- `GET /api/crop-health/history` - Get scan history

### Market Intelligence
- `GET /api/market/crops` - Get available crops
- `GET /api/market/prices/:crop` - Get crop prices
- `GET /api/market/trends/:crop` - Get price trends

### Government Schemes
- `GET /api/schemes` - Search schemes
- `GET /api/schemes/:id` - Get scheme details
- `POST /api/schemes/check-eligibility` - Check eligibility

### Carbon Credits
- `GET /api/carbon-credits/market` - Get market info
- `POST /api/carbon-credits/calculate` - Calculate credits
- `GET /api/carbon-credits/projects` - Get user projects

## 🎯 Next Steps

### Phase 1: Real AI Integration
- [ ] Replace mock Vertex AI with real Gemini API
- [ ] Implement image processing pipeline
- [ ] Add disease database

### Phase 2: Market Data APIs
- [ ] Integrate real mandi price APIs
- [ ] Add historical data charts
- [ ] Implement price alerts

### Phase 3: Voice Interface
- [ ] Add Google Speech-to-Text
- [ ] Implement Text-to-Speech
- [ ] Add local language support

### Phase 4: Carbon Credits
- [ ] Real MRV calculations
- [ ] Satellite data integration
- [ ] Carbon marketplace

## 🐛 Troubleshooting

### Common Issues

1. **500 Server Errors**
   - Check if backend is running
   - Verify environment variables
   - Check service account key path

2. **Authentication Issues**
   - Verify Firebase config
   - Check Firebase project settings
   - Ensure Email/Password auth is enabled

3. **CORS Errors**
   - Backend is configured for localhost:3000
   - Check if ports match

4. **Image Upload Issues**
   - Verify file size limits
   - Check file type restrictions
   - Ensure backend storage is configured

## 📱 Mobile Responsiveness

The app is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones
- Progressive Web App (PWA) ready

## 🔒 Security Features

- Protected routes with authentication
- Firebase security rules
- Input validation and sanitization
- Secure file upload handling

## 📊 Performance

- Lazy loading of components
- Optimized image handling
- Efficient API calls
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for Indian Farmers**
