const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Add this line to test if .env is working
console.log('Environment check:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID ? 'SET' : 'NOT SET'
});

const authRoutes = require('./routes/auth');
const loginRoutes = require('./routes/login');
const cropHealthRoutes = require('./routes/cropHealth');
const marketIntelligenceRoutes = require('./routes/marketIntelligence');
const governmentSchemesRoutes = require('./routes/governmentSchemes');
const carbonCreditsRoutes = require('./routes/carbonCredits');
// const voiceInterfaceRoutes = require('./routes/voiceInterface');
const analyticsRoutes = require('./routes/analytics');
const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/auth', authRoutes);
app.use('/login-signup', loginRoutes);
app.use('/', loginRoutes);
app.use('/api/crop-health', cropHealthRoutes);
app.use('/api/market', marketIntelligenceRoutes);
app.use('/api/schemes', governmentSchemesRoutes);
app.use('/api/carbon-credits', carbonCreditsRoutes);
// Disable voice interface completely
// if (process.env.ENABLE_VOICE_INTERFACE === 'true') {
//   app.use('/api/voice', voiceInterfaceRoutes);
// }
app.use('/api/analytics', analyticsRoutes);
app.use('/chat', chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 KisanSetu Server running on port ${PORT}`);
    console.log(`🌱 Crop Health API: http://localhost:${PORT}/api/crop-health`);
    console.log(`📊 Market Intelligence API: http://localhost:${PORT}/api/market`);
    console.log(`🏛️ Government Schemes API: http://localhost:${PORT}/api/schemes`);
    console.log(`🌳 Carbon Credits API: http://localhost:${PORT}/api/carbon-credits`);
    console.log(`🎤 Voice Interface API: http://localhost:${PORT}/api/voice`);
});
