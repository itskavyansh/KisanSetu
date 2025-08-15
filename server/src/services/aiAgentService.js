class AIAgentService {
  constructor() {
    this.conversationHistory = new Map();
    this.intentPatterns = {
      'crop_disease': [
        'ರೋಗ', 'ಬೇನೆ', 'ರೋಗ', 'disease', 'sick', 'yellow', 'spots', 'leaves'
      ],
      'market_prices': [
        'ಬೆಲೆ', 'ಮಾರುಕಟ್ಟೆ', 'price', 'market', 'sell', 'buy', 'mandi'
      ],
      'government_schemes': [
        'ಸಬ್ಸಿಡಿ', 'ಯೋಜನೆ', 'scheme', 'subsidy', 'government', 'help'
      ],
      'carbon_credits': [
        'ಕಾರ್ಬನ್', 'ಹಣ', 'carbon', 'money', 'environment', 'tree'
      ],
      'weather': [
        'ಹವಾಮಾನ', 'ಮಳೆ', 'weather', 'rain', 'temperature', 'climate'
      ]
    };
  }

  async processQuery(query, language = 'kannada', userId = 'default') {
    try {
      // Detect intent from query
      const intent = this.detectIntent(query, language);
      
      // Generate response based on intent
      const response = await this.generateResponse(intent, query, language);
      
      // Store conversation history
      this.updateConversationHistory(userId, query, response);
      
      return {
        success: true,
        data: {
          intent: intent,
          response: response,
          language: language,
          confidence: 0.88,
          suggestions: this.generateSuggestions(intent, language),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to process query: ${error.message}`);
    }
  }

  detectIntent(query, language) {
    const queryLower = query.toLowerCase();
    
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        if (queryLower.includes(pattern.toLowerCase())) {
          return intent;
        }
      }
    }
    
    return 'general_inquiry';
  }

  async generateResponse(intent, query, language) {
    const responses = {
      'crop_disease': {
        'kannada': 'ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ಪರೀಕ್ಷಿಸಲು ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ. ನಾನು ರೋಗವನ್ನು ಗುರುತಿಸಿ ಚಿಕಿತ್ಸೆ ಸಲಹೆ ಮಾಡುತ್ತೇನೆ.',
        'hindi': 'अपनी फसल की फोटो अपलोड करें। मैं रोग की पहचान कर उपचार सुझाऊंगा।',
        'english': 'Please upload a photo of your crop. I will identify the disease and suggest treatment.'
      },
      'market_prices': {
        'kannada': 'ಯಾವ ಬೆಳೆಯ ಬೆಲೆ ತಿಳಿಯಬೇಕು? ನಾನು ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ತೋರಿಸುತ್ತೇನೆ.',
        'hindi': 'किस फसल की कीमत जानना चाहते हैं? मैं आज के बाजार भाव दिखाऊंगा।',
        'english': 'Which crop price do you want to know? I will show today\'s market prices.'
      },
      'government_schemes': {
        'kannada': 'ಯಾವ ರೀತಿಯ ಸಹಾಯ ಬೇಕು? ನಾನು ನಿಮಗೆ ಯೋಗ್ಯವಾದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕುತ್ತೇನೆ.',
        'hindi': 'किस तरह की मदद चाहिए? मैं आपके लिए उपयुक्त सरकारी योजनाएं ढूंढूंगा।',
        'english': 'What kind of help do you need? I will find suitable government schemes for you.'
      },
      'carbon_credits': {
        'kannada': 'ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್ಗಳಿಂದ ಹಣ ಗಳಿಸಲು ಬಯಸುವಿರಾ? ನಾನು ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ಮಾಡುತ್ತೇನೆ.',
        'hindi': 'कार्बन क्रेडिट से पैसा कमाना चाहते हैं? मैं आपका मार्गदर्शन करूंगा।',
        'english': 'Want to earn money from carbon credits? I will guide you through the process.'
      },
      'weather': {
        'kannada': 'ನಿಮ್ಮ ಪ್ರದೇಶದ ಹವಾಮಾನ ಮಾಹಿತಿ ಬೇಕಾ? ನಾನು ಮುಂಗಾಣಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
        'hindi': 'अपने क्षेत्र का मौसम जानना चाहते हैं? मैं पूर्वानुमान में मदद करूंगा।',
        'english': 'Need weather information for your area? I will help with the forecast.'
      },
      'general_inquiry': {
        'kannada': 'ನಿಮಗೆ ಯಾವುದೇ ಕೃಷಿ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆ ಇದ್ದರೆ ಕೇಳಿ. ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
        'hindi': 'कोई भी कृषि संबंधित प्रश्न हो तो पूछें। मैं मदद करूंगा।',
        'english': 'Ask any agriculture-related question. I will help you.'
      }
    };
    
    return responses[intent]?.[language] || responses[intent]?.['english'] || responses['general_inquiry']['english'];
  }

  generateSuggestions(intent, language) {
    const suggestions = {
      'crop_disease': {
        'kannada': ['ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ', 'ರೋಗ ಚಿಕಿತ್ಸೆ', 'ತಜ್ಞರ ಸಲಹೆ'],
        'hindi': ['फोटो अपलोड करें', 'रोग उपचार', 'विशेषज्ञ सलाह'],
        'english': ['Upload Photo', 'Disease Treatment', 'Expert Advice']
      },
      'market_prices': {
        'kannada': ['ಇಂದಿನ ಬೆಲೆಗಳು', 'ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿ', 'ಮಾರಾಟ ಸಲಹೆ'],
        'hindi': ['आज के भाव', 'बाजार प्रवृत्ति', 'बिक्री सलाह'],
        'english': ['Today\'s Prices', 'Market Trends', 'Sales Advice']
      },
      'government_schemes': {
        'kannada': ['ಸಬ್ಸಿಡಿ ಹುಡುಕಿ', 'ಯೋಜನೆಗಳು', 'ಅರ್ಜಿ ಸಹಾಯ'],
        'hindi': ['सब्सिडी खोजें', 'योजनाएं', 'आवेदन सहायता'],
        'english': ['Search Subsidies', 'Schemes', 'Application Help']
      }
    };
    
    return suggestions[intent]?.[language] || suggestions[intent]?.['english'] || [];
  }

  updateConversationHistory(userId, query, response) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    
    const history = this.conversationHistory.get(userId);
    history.push({
      query,
      response,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 conversations
    if (history.length > 10) {
      history.shift();
    }
  }

  async getConversationHistory(userId) {
    try {
      const history = this.conversationHistory.get(userId) || [];
      
      return {
        success: true,
        data: {
          userId,
          conversations: history,
          total: history.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to get conversation history: ${error.message}`);
    }
  }
}

module.exports = new AIAgentService();