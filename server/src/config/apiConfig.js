// API Configuration for Real Data Integration
// Add your actual API keys here for production use

module.exports = {
  // Weather APIs
  weather: {
    openWeatherMap: {
      apiKey: process.env.OPENWEATHER_API_KEY || 'your_openweather_api_key',
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      units: 'metric'
    },
    weatherAPI: {
      apiKey: process.env.WEATHERAPI_KEY || 'your_weatherapi_key',
      baseUrl: 'https://api.weatherapi.com/v1'
    }
  },

  // Agricultural Market APIs
  market: {
    agmarknet: {
      baseUrl: 'https://agmarknet.gov.in/api/v1',
      // Note: Agmarknet doesn't have a public API
      // You'll need to partner with them or use data feeds
    },
    fao: {
      baseUrl: 'https://api.fao.org',
      apiKey: process.env.FAO_API_KEY || 'your_fao_api_key'
    },
    // Alternative market data sources
    alternative: {
      baseUrl: 'https://api.example.com', // Replace with actual API
      apiKey: process.env.ALTERNATIVE_API_KEY || 'your_alternative_api_key'
    }
  },

  // AI and Image Analysis APIs
  ai: {
    plantId: {
      apiKey: process.env.PLANT_ID_API_KEY || 'your_plant_id_api_key',
      baseUrl: 'https://api.plant.id/v2',
      plan: 'free' // or 'premium' for more features
    },
    googleVision: {
      apiKey: process.env.GOOGLE_VISION_API_KEY || 'your_google_vision_api_key',
      baseUrl: 'https://vision.googleapis.com/v1',
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'your_google_project_id'
    },
    // Alternative AI services
    alternative: {
      apiKey: process.env.ALTERNATIVE_AI_API_KEY || 'your_alternative_ai_api_key',
      baseUrl: 'https://api.example.com'
    }
  },

  // Government and Scheme APIs
  government: {
    pmKisan: {
      baseUrl: 'https://pmkisan.gov.in/api', // Example endpoint
      apiKey: process.env.PMKISAN_API_KEY || 'your_pmkisan_api_key'
    },
    stateSchemes: {
      karnataka: {
        baseUrl: 'https://api.karnataka.gov.in/schemes',
        apiKey: process.env.KARNATAKA_API_KEY || 'your_karnataka_api_key'
      },
      // Add other states as needed
    }
  },

  // Carbon Credits and Sustainability APIs
  carbon: {
    goldStandard: {
      baseUrl: 'https://api.goldstandard.org',
      apiKey: process.env.GOLDSTANDARD_API_KEY || 'your_goldstandard_api_key'
    },
    verra: {
      baseUrl: 'https://api.verra.org',
      apiKey: process.env.VERRA_API_KEY || 'your_verra_api_key'
    },
    climate: {
      baseUrl: 'https://api.climate.example.com', // Replace with actual API
      apiKey: process.env.CLIMATE_API_KEY || 'your_climate_api_key'
    }
  },

  // Voice and Language APIs
  voice: {
    googleSpeech: {
      apiKey: process.env.GOOGLE_SPEECH_API_KEY || 'your_google_speech_api_key',
      baseUrl: 'https://speech.googleapis.com/v1',
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'your_google_project_id'
    },
    openAI: {
      apiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo'
    }
  },

  // Database and Storage
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kisansetu',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null
    }
  },

  // External Services
  external: {
    sms: {
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || 'your_twilio_account_sid',
        authToken: process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'your_twilio_phone_number'
      }
    },
    email: {
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY || 'your_sendgrid_api_key',
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@kisansetu.com'
      }
    }
  },

  // Feature Flags
  features: {
    realMarketData: process.env.ENABLE_REAL_MARKET_DATA === 'true',
    aiCropAnalysis: process.env.ENABLE_AI_CROP_ANALYSIS === 'true',
    weatherIntegration: process.env.ENABLE_WEATHER_INTEGRATION === 'true',
    governmentSchemes: process.env.ENABLE_GOVERNMENT_SCHEMES === 'true',
    carbonCredits: process.env.ENABLE_CARBON_CREDITS === 'true',
    voiceInterface: process.env.ENABLE_VOICE_INTERFACE === 'true'
  },

  // Rate Limiting
  rateLimit: {
    marketData: {
      requestsPerMinute: 60,
      burstSize: 100
    },
    aiAnalysis: {
      requestsPerMinute: 30,
      burstSize: 50
    },
    weatherData: {
      requestsPerMinute: 100,
      burstSize: 200
    }
  },

  // Cache Settings
  cache: {
    marketData: {
      ttl: 15 * 60 * 1000, // 15 minutes
      maxSize: 1000
    },
    weatherData: {
      ttl: 10 * 60 * 1000, // 10 minutes
      maxSize: 500
    },
    cropAnalysis: {
      ttl: 60 * 60 * 1000, // 1 hour
      maxSize: 200
    }
  }
};

