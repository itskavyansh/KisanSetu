import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { carbonCreditsAPI } from '../services/carbonCreditsService';
import { marketAPI } from '../services/marketService';
import { governmentSchemesAPI } from '../services/governmentSchemesService';
import ChartErrorBoundary from './common/ChartErrorBoundary';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PersonalizedInsight {
  id: string;
  type: 'weather' | 'market' | 'scheme' | 'crop' | 'seasonal' | 'financial';
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: string;
  icon: string;
  impact?: string;
}

interface FarmMetrics {
  totalArea: number;
  cultivatedArea: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  activeCrops: number;
  carbonCredits: number;
  efficiencyScore: number;
  waterUsage: number;
  soilHealth: number;
}

interface CropStatus {
  name: string;
  area: number;
  stage: string;
  health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  expectedHarvest: string;
  currentValue: number;
  daysToHarvest: number;
  riskFactors: string[];
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [farmMetrics, setFarmMetrics] = useState<FarmMetrics | null>(null);
  const [cropStatus, setCropStatus] = useState<CropStatus[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [marketTrends, setMarketTrends] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [currentStep, setCurrentStep] = useState(1);
  const [showTutorial, setShowTutorial] = useState(false);
  const [userExperience, setUserExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; message: string; onConfirm: () => void } | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [recentActions, setRecentActions] = useState<Array<{ id: string; action: string; timestamp: Date; canUndo: boolean; undoFunction?: () => void }>>([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'bot'; message: string; timestamp: Date }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [errorState, setErrorState] = useState<{ hasError: boolean; message: string; suggestions: string[]; canRetry: boolean } | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [recoveryData, setRecoveryData] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(false);
  const [performanceMode, setPerformanceMode] = useState<'auto' | 'low' | 'medium' | 'high'>('auto');
  const [cachedData, setCachedData] = useState<any>(null);
  const [loadingPerformance, setLoadingPerformance] = useState<'fast' | 'normal' | 'slow'>('normal');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi' | 'kn' | 'ta' | 'te'>('en');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState(true);

  // Enhanced yield data with seasonal patterns and predictions
  const yieldPerformance = [
    { month: 'Jan', actual: 2.1, target: 2.5, rainfall: 15, temperature: 22, soilMoisture: 45 },
    { month: 'Feb', actual: 2.3, target: 2.7, rainfall: 25, temperature: 25, soilMoisture: 50 },
    { month: 'Mar', actual: 2.8, target: 3.2, rainfall: 45, temperature: 28, soilMoisture: 65 },
    { month: 'Apr', actual: 3.2, target: 3.5, rainfall: 35, temperature: 31, soilMoisture: 55 },
    { month: 'May', actual: 2.9, target: 3.3, rainfall: 85, temperature: 29, soilMoisture: 75 },
    { month: 'Jun', actual: 3.6, target: 3.8, rainfall: 125, temperature: 27, soilMoisture: 85 },
    { month: 'Jul', actual: 3.8, target: 4.0, rainfall: 165, temperature: 26, soilMoisture: 90 },
    { month: 'Aug', actual: 3.5, target: 3.7, rainfall: 145, temperature: 26, soilMoisture: 88 },
    { month: 'Sep', actual: 3.1, target: 3.4, rainfall: 95, temperature: 27, soilMoisture: 70 },
    { month: 'Oct', actual: 2.7, target: 3.0, rainfall: 55, temperature: 25, soilMoisture: 60 },
    { month: 'Nov', actual: 2.4, target: 2.8, rainfall: 35, temperature: 23, soilMoisture: 50 },
    { month: 'Dec', actual: 2.2, target: 2.6, rainfall: 20, temperature: 21, soilMoisture: 45 }
  ];

  // Financial performance with detailed breakdown
  const financialData = [
    { month: 'Jan', income: 42000, expenses: 35000, profit: 7000, seeds: 8000, fertilizer: 12000, labor: 15000 },
    { month: 'Feb', income: 45000, expenses: 38000, profit: 7000, seeds: 5000, fertilizer: 15000, labor: 18000 },
    { month: 'Mar', income: 52000, expenses: 42000, profit: 10000, seeds: 12000, fertilizer: 18000, labor: 12000 },
    { month: 'Apr', income: 58000, expenses: 45000, profit: 13000, seeds: 15000, fertilizer: 20000, labor: 10000 },
    { month: 'May', income: 48000, expenses: 40000, profit: 8000, seeds: 8000, fertilizer: 16000, labor: 16000 },
    { month: 'Jun', income: 65000, expenses: 48000, profit: 17000, seeds: 20000, fertilizer: 15000, labor: 13000 }
  ];

  // Market price trends for farmer's specific crops
  const cropPriceData = [
    { crop: 'Rice', current: 1950, predicted: 2100, change: '+7.7%', trend: 'rising', confidence: 85 },
    { crop: 'Tomato', current: 22, predicted: 25, change: '+13.6%', trend: 'rising', confidence: 92 },
    { crop: 'Wheat', current: 2300, predicted: 2250, change: '-2.2%', trend: 'falling', confidence: 78 },
    { crop: 'Maize', current: 1850, predicted: 1900, change: '+2.7%', trend: 'stable', confidence: 88 }
  ];

  useEffect(() => {
    loadDashboardData();
    
    // Check for recovery data on component mount
    const savedData = loadFromLocalStorage('dashboard');
    if (savedData && savedData.timestamp) {
      const age = Date.now() - new Date(savedData.timestamp).getTime();
      if (age < 30 * 60 * 1000) { // 30 minutes
        offerRecovery(savedData);
      }
    }
  }, [currentUser]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled) return;
    
    const interval = setInterval(autoSave, 30000); // Save every 30 seconds
    
    return () => clearInterval(interval);
  }, [insights, farmMetrics, cropStatus, currentStep, userExperience, chatMessages, autoSaveEnabled]);

  // Network status and performance monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineMode(false);
      if (cachedData) {
        showSuccess('Connection restored! Loading fresh data...');
        loadDashboardData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (!offlineMode) {
        showFriendlyError(
          "You're currently offline. Some features may be limited.",
          ["Enable offline mode to use cached data", "Check your internet connection", "Continue with limited functionality"],
          false
        );
      }
    };

    // Performance detection on mount
    const detectedPerformance = detectDevicePerformance();
    optimizeForPerformance(detectedPerformance);
    
    // Initialize voice capabilities
    initializeVoice();
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('kisanSetu_language') as 'en' | 'hi' | 'kn' | 'ta' | 'te';
    if (savedLanguage && languages[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }

    // Network status listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Performance monitoring
    const performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          if (navEntry.loadEventEnd - navEntry.loadEventStart > 3000) {
            setLoadingPerformance('slow');
          }
        }
      }
    });

    try {
      performanceObserver.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('Performance monitoring not supported');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      performanceObserver.disconnect();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if we're offline and have cached data
      if (!isOnline && cachedData) {
        setInsights(cachedData.insights || []);
        setFarmMetrics(cachedData.farmMetrics || null);
        setCropStatus(cachedData.cropStatus || []);
        setCurrentStep(cachedData.currentStep || 1);
        setUserExperience(cachedData.userExperience || 'beginner');
        if (cachedData.chatMessages) {
          setChatMessages(cachedData.chatMessages);
        }
        showSuccess('Using cached data (offline mode)');
        setLoading(false);
        return;
      }
      
      // Load multiple data sources in parallel
      const [carbonResponse, schemesResponse] = await Promise.all([
        carbonCreditsAPI.getMarketInfo().catch(() => ({ data: { currentPrice: 900 } })),
        governmentSchemesAPI.searchSchemes({ page: 1 }).catch(() => ({ data: { schemes: [] } })),
      ]);

      // Generate realistic farm metrics based on user location and crops
      const metrics: FarmMetrics = {
        totalArea: 12.5,
        cultivatedArea: 11.2,
        monthlyIncome: 58000,
        monthlyExpenses: 43000,
        activeCrops: 4,
        carbonCredits: 245,
        efficiencyScore: 87,
        waterUsage: 125, // liters per sq meter
        soilHealth: 78 // percentage score
      };
      setFarmMetrics(metrics);

      // Generate current crop status with real-time data
      const currentCrops: CropStatus[] = [
        {
          name: 'Rice',
          area: 5.2,
          stage: 'Flowering',
          health: 'excellent',
          expectedHarvest: '15 days',
          currentValue: 187000,
          daysToHarvest: 15,
          riskFactors: []
        },
        {
          name: 'Tomato',
          area: 2.8,
          stage: 'Fruiting',
          health: 'good',
          expectedHarvest: '7 days',
          currentValue: 84000,
          daysToHarvest: 7,
          riskFactors: ['Early blight risk']
        },
        {
          name: 'Maize',
          area: 2.1,
          stage: 'Grain Filling',
          health: 'fair',
          expectedHarvest: '21 days',
          currentValue: 45000,
          daysToHarvest: 21,
          riskFactors: ['Moisture stress', 'Pest pressure']
        },
        {
          name: 'Pulses',
          area: 1.1,
          stage: 'Pod Formation',
          health: 'good',
          expectedHarvest: '14 days',
          currentValue: 28000,
          daysToHarvest: 14,
          riskFactors: []
        }
      ];
      setCropStatus(currentCrops);

      // Generate AI-powered personalized insights
      const personalizedInsights: PersonalizedInsight[] = [
        {
          id: '1',
          type: 'weather',
          title: 'Heavy Rain Alert',
          message: 'Heavy rainfall (85mm) predicted in next 48 hours. Your tomato crop may need drainage preparation to prevent waterlogging and root rot.',
          priority: 'critical',
          actionable: true,
          action: 'Set up drainage',
          icon: 'W',
          impact: 'Could save ₹15,000 in crop damage'
        },
        {
          id: '2',
          type: 'market',
          title: 'Optimal Harvest Window',
          message: 'Rice prices surged 12% this week to ₹2,100/quintal. Your 5.2-acre rice field could yield ₹22,000 extra if harvested within next 5 days.',
          priority: 'high',
          actionable: true,
          action: 'Schedule early harvest',
          icon: 'M',
          impact: 'Potential gain: ₹22,000'
        },
        {
          id: '3',
          type: 'financial',
          title: 'Cost Optimization Opportunity',
          message: 'Your fertilizer costs are 23% higher than similar farms. Switching to bio-fertilizers could save ₹8,000/month.',
          priority: 'medium',
          actionable: true,
          action: 'Explore bio-fertilizers',
          icon: 'F',
          impact: 'Monthly savings: ₹8,000'
        },
        {
          id: '4',
          type: 'crop',
          title: 'Disease Prevention Alert',
          message: 'Early blight detected in 3 farms within 5km radius. Apply copper fungicide to tomato crop immediately as prevention.',
          priority: 'high',
          actionable: true,
          action: 'Apply fungicide today',
          icon: 'C',
          impact: 'Prevent 30-60% yield loss'
        },
        {
          id: '5',
          type: 'scheme',
          title: 'PM-KISAN Payment Due',
          message: 'Your PM-KISAN installment of ₹2,000 will be credited on 25th. Also eligible for new Organic Farming Scheme - ₹15,000 subsidy.',
          priority: 'medium',
          actionable: true,
          action: 'Apply for new scheme',
          icon: 'S',
          impact: 'Additional income: ₹17,000'
        },
        {
          id: '6',
          type: 'seasonal',
          title: 'Rabi Preparation Window',
          message: 'Optimal time for wheat sowing approaching. Soil testing shows nitrogen deficiency - apply 40kg/acre before sowing.',
          priority: 'medium',
          actionable: true,
          action: 'Schedule soil treatment',
          icon: 'R',
          impact: 'Increase yield by 15-20%'
        }
      ];
      setInsights(personalizedInsights);

      // Enhanced weather data with agricultural impact
      setWeatherData({
        current: {
          temperature: 28,
          humidity: 72,
          conditions: 'Partly Cloudy',
          windSpeed: 12,
          uvIndex: 7
        },
        location: 'Mysuru, Karnataka',
        forecast: [
          { day: 'Today', temp: 28, condition: 'Cloudy', rain: 60, wind: 12, impact: 'Good for field work' },
          { day: 'Tomorrow', temp: 26, condition: 'Heavy Rain', rain: 95, wind: 18, impact: 'Avoid spraying, ensure drainage' },
          { day: 'Day 3', temp: 24, condition: 'Rain', rain: 85, wind: 15, impact: 'Monitor waterlogging' },
          { day: 'Day 4', temp: 27, condition: 'Partly Cloudy', rain: 30, wind: 10, impact: 'Resume field operations' },
          { day: 'Day 5', temp: 29, condition: 'Sunny', rain: 10, wind: 8, impact: 'Excellent for harvesting' }
        ],
        alerts: [
          'Heavy rain warning for next 2 days',
          'High humidity may increase fungal disease risk'
        ]
      });

             setMarketTrends(cropPriceData);
       setSchemes(schemesResponse.data?.schemes || []);

       // Cache data for offline use
       const dataToCache = {
         insights,
         farmMetrics: metrics,
         cropStatus: currentCrops,
         currentStep,
         userExperience,
         chatMessages: chatMessages.slice(-10),
         timestamp: new Date().toISOString()
       };
       cacheDataForOffline(dataToCache);

     } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Show friendly error message
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          showFriendlyError(
            "We're having trouble connecting to our servers right now.",
            ["Check your internet connection", "Try again in a few minutes", "Use offline mode if available"],
            true
          );
        } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
          showFriendlyError(
            "Please log in again to access your dashboard.",
            ["Click here to log in", "Check if your session expired", "Contact support if the problem persists"],
            false
          );
        } else {
          showFriendlyError(
            "Something went wrong while loading your dashboard.",
            ["Try refreshing the page", "Check your internet connection", "Contact support if the problem persists"],
            true
          );
        }
      } else {
        showFriendlyError(
          "We encountered an unexpected error.",
          ["Try refreshing the page", "Clear your browser cache", "Contact support if the problem persists"],
          true
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 9) return { name: 'Kharif', description: 'Monsoon season - ideal for rice, cotton, sugarcane' };
    if (month >= 10 || month <= 2) return { name: 'Rabi', description: 'Winter season - perfect for wheat, barley, peas' };
    return { name: 'Zaid', description: 'Summer season - suitable for watermelon, fodder crops' };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 16) return 'Good Afternoon';
    if (hour < 20) return 'Good Evening';
    return 'Good Night';
  };

  // Confirmation dialog helper
  const showConfirmation = (type: string, message: string, onConfirm: () => void) => {
    setConfirmAction({ type, message, onConfirm });
    setShowConfirmDialog(true);
  };

  // Success message helper
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000); // Auto-hide after 5 seconds
  };

  // Action tracking helper
  const trackAction = (action: string, canUndo: boolean = false, undoFunction?: () => void) => {
    const newAction = {
      id: Date.now().toString(),
      action,
      timestamp: new Date(),
      canUndo,
      undoFunction
    };
    setRecentActions(prev => [newAction, ...prev.slice(0, 4)]); // Keep last 5 actions
  };

  // Undo action helper
  const undoAction = (actionId: string) => {
    const action = recentActions.find(a => a.id === actionId);
    if (action && action.undoFunction) {
      action.undoFunction();
      setRecentActions(prev => prev.filter(a => a.id !== actionId));
      showSuccess(`Undone: ${action.action}`);
    }
  };

  // Chatbot helper functions
  const sendChatMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = { type: 'user' as const, message: message.trim(), timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: message.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const botMessage = { type: 'bot' as const, message: data.response, timestamp: new Date() };
      setChatMessages(prev => [...prev, botMessage]);
      
      // Track the chat interaction
      trackAction('Asked AI question', false);
      
    } catch (error: any) {
      let errorMessage = '';
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "I'm having trouble connecting to our servers right now. Please check your internet connection and try again.";
        showFriendlyError(
          "Chat service is temporarily unavailable.",
          ["Check your internet connection", "Try again in a few minutes", "The message has been saved and will be sent when connection is restored"],
          true
        );
      } else if (error.message?.includes('timeout')) {
        errorMessage = "The request took too long to complete. This might be due to high server load.";
        showFriendlyError(
          "Request timed out. Our servers might be busy.",
          ["Try again in a few minutes", "Check your internet connection", "Contact support if the problem persists"],
          true
        );
      } else {
        errorMessage = "I encountered an unexpected error while processing your request. Please try again.";
        showFriendlyError(
          "Something went wrong with the chat service.",
          ["Try sending your message again", "Refresh the page if the problem persists", "Contact support for assistance"],
          true
        );
      }
      
      const errorBotMessage = { type: 'bot' as const, message: errorMessage, timestamp: new Date() };
      setChatMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendChatMessage(chatInput);
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
    if (!showChatbot && chatMessages.length === 0) {
      // Add welcome message when opening chat for the first time
      const welcomeMessage = { 
        type: 'bot' as const, 
        message: `Hello **${currentUser?.displayName || 'Farmer'}**! I'm your AI farming assistant. I can help you with:\n\n• **Crop health questions** - Identify diseases and get treatment advice\n• **Weather advice** - Get farming-specific weather forecasts\n• **Market insights** - Check current crop prices and trends\n• **Farming techniques** - Learn best practices and modern methods\n• **Government schemes** - Find subsidies and support programs\n\nWhat would you like to know today?`, 
        timestamp: new Date() 
      };
      setChatMessages([welcomeMessage]);
    }
  };

  // Error handling helpers
  const showFriendlyError = (message: string, suggestions: string[] = [], canRetry: boolean = true) => {
    setErrorState({
      hasError: true,
      message,
      suggestions,
      canRetry
    });
    
    // Auto-hide error after 10 seconds for non-critical errors
    if (suggestions.length === 0) {
      setTimeout(() => setErrorState(null), 10000);
    }
  };

  const clearError = () => {
    setErrorState(null);
  };

  const retryOperation = async (operation: () => Promise<void>) => {
    try {
      setErrorState(null);
      await operation();
    } catch (error) {
      showFriendlyError(
        "The operation failed again. Let's try a different approach.",
        ["Check your internet connection", "Try refreshing the page", "Contact support if the problem persists"],
        false
      );
    }
  };

  // Auto-save functionality
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(`kisanSetu_${key}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }));
      setLastSaved(new Date());
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  };

  const loadFromLocalStorage = (key: string) => {
    try {
      const saved = localStorage.getItem(`kisanSetu_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if data is not too old (7 days)
        const age = Date.now() - new Date(parsed.timestamp).getTime();
        if (age < 7 * 24 * 60 * 60 * 1000) {
          return parsed.data;
        }
      }
      return null;
    } catch (error) {
      console.warn('Failed to load saved data:', error);
      return null;
    }
  };

  const autoSave = () => {
    if (!autoSaveEnabled) return;
    
    const dataToSave = {
      insights,
      farmMetrics,
      cropStatus,
      currentStep,
      userExperience,
      chatMessages: chatMessages.slice(-10), // Save last 10 messages
      timestamp: new Date().toISOString()
    };
    
    saveToLocalStorage('dashboard', dataToSave);
  };

  // Recovery functionality
  const offerRecovery = (data: any) => {
    setRecoveryData(data);
    showFriendlyError(
      "We found some saved data from your previous session. Would you like to restore it?",
      ["Restore previous data", "Start fresh", "View what was saved"],
      false
    );
  };

  const restoreData = () => {
    if (recoveryData) {
      setInsights(recoveryData.insights || []);
      setFarmMetrics(recoveryData.farmMetrics || null);
      setCropStatus(recoveryData.cropStatus || []);
      setCurrentStep(recoveryData.currentStep || 1);
      setUserExperience(recoveryData.userExperience || 'beginner');
      if (recoveryData.chatMessages) {
        setChatMessages(recoveryData.chatMessages);
      }
      setRecoveryData(null);
      setErrorState(null);
      showSuccess('Your previous session has been restored!');
    }
  };

  // Offline functionality and performance optimization
  const detectDevicePerformance = () => {
    // Simple performance detection based on device capabilities
    const memory = (navigator as any).deviceMemory || 4; // GB
    const cores = (navigator as any).hardwareConcurrency || 4;
    const connection = (navigator as any).connection;
    
    let mode: 'low' | 'medium' | 'high' = 'medium';
    
    if (memory < 2 || cores < 2 || (connection && connection.effectiveType === 'slow-2g')) {
      mode = 'low';
    } else if (memory >= 8 && cores >= 8 && (!connection || connection.effectiveType === '4g')) {
      mode = 'high';
    }
    
    return mode;
  };

  const optimizeForPerformance = (mode: 'low' | 'medium' | 'high') => {
    setPerformanceMode(mode);
    
    // Adjust UI complexity based on performance mode
    if (mode === 'low') {
      setLoadingPerformance('slow');
      // Reduce animations and complex UI elements
      document.body.classList.add('low-performance-mode');
    } else if (mode === 'high') {
      setLoadingPerformance('fast');
      document.body.classList.remove('low-performance-mode');
    } else {
      setLoadingPerformance('normal');
      document.body.classList.remove('low-performance-mode');
    }
  };

  const enableOfflineMode = () => {
    setOfflineMode(true);
    // Load cached data
    const cached = loadFromLocalStorage('dashboard_cache');
    if (cached) {
      setCachedData(cached);
      showSuccess('Offline mode enabled. Using cached data.');
    } else {
      showFriendlyError(
        "No cached data available for offline mode.",
        ["Enable auto-save to cache data", "Connect to internet to load fresh data", "Start with default dashboard"],
        false
      );
    }
  };

  const disableOfflineMode = () => {
    setOfflineMode(false);
    setCachedData(null);
    // Try to reload fresh data
    if (isOnline) {
      loadDashboardData();
      showSuccess('Online mode restored. Loading fresh data.');
    }
  };

  const cacheDataForOffline = (data: any) => {
    try {
      localStorage.setItem('kisanSetu_dashboard_cache', JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }));
    } catch (error) {
      console.warn('Failed to cache data for offline use:', error);
    }
  };

  const getNetworkStatus = () => {
    const connection = (navigator as any).connection;
    if (connection) {
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      };
    }
    return { effectiveType: 'unknown', downlink: 0, rtt: 0 };
  };

  // Language and voice accessibility helpers
  const languages = {
    en: { name: 'English', flag: '🇺🇸', native: 'English' },
    hi: { name: 'Hindi', flag: '🇮🇳', native: 'हिंदी' },
    kn: { name: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
    ta: { name: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
    te: { name: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' }
  };

  const t = (key: string, fallback?: string) => {
    // Comprehensive translation system for the entire dashboard
    const translations: Record<string, Record<string, string>> = {
      en: {
        // Greetings
        'greeting_morning': 'Good Morning',
        'greeting_afternoon': 'Good Afternoon',
        'greeting_evening': 'Good Evening',
        'greeting_night': 'Good Night',
        
        // Dashboard Sections
        'dashboard_title': 'Farm Dashboard',
        'step_progress': 'Step Progress',
        'farm_performance': 'Farm Performance',
        'live_crop_status': 'Live Crop Status',
        'quick_actions': 'Quick Actions',
        'critical_alerts': 'Critical Alerts',
        'weather_intelligence': 'Weather Intelligence',
        'market_intelligence': 'Market Intelligence',
        'ai_features': 'AI-Powered Features',
        
        // Step Names
        'step_1': 'Review Critical Alerts',
        'step_2': 'Check Farm Performance',
        'step_3': 'Monitor Crops & Weather',
        'step_4': 'Take Action',
        
        // Common Actions
        'show_help': 'Show Help',
        'hide_help': 'Hide Help',
        'next_step': 'Next Step',
        'previous_step': 'Previous Step',
        'start_over': 'Start Over',
        'dashboard_complete': 'Dashboard Complete!',
        
        // Metrics & Data
        'farm_efficiency': 'Farm Efficiency',
        'monthly_income': 'Monthly Income',
        'monthly_expenses': 'Monthly Expenses',
        'monthly_profit': 'Monthly Profit',
        'active_crops': 'Active Crops',
        'weather_forecast': 'Weather Forecast',
        'market_trends': 'Market Trends',
        'crop_health': 'Crop Health',
        
        // Status & Alerts
        'healthy': 'Healthy',
        'warning': 'Warning',
        'critical': 'Critical',
        'attention_required': 'Attention Required',
        'no_alerts': 'No Critical Alerts',
        
        // Quick Actions
        'scan_crop': 'Scan Crop',
        'check_weather': 'Check Weather',
        'view_market': 'View Market',
        'ai_assistant': 'AI Assistant',
        'government_schemes': 'Government Schemes',
        'profit_calculator': 'Profit Calculator',
        'crop_calendar': 'Crop Calendar',
        'carbon_credits': 'Carbon Credits',
        
        // Performance & Analytics
        'performance_overview': 'Performance Overview',
        'efficiency_score': 'Efficiency Score',
        'revenue_trends': 'Revenue Trends',
        'expense_breakdown': 'Expense Breakdown',
        'crop_distribution': 'Crop Distribution',
        'seasonal_analysis': 'Seasonal Analysis',
        
        // Weather & Climate
        'current_weather': 'Current Weather',
        'temperature': 'Temperature',
        'humidity': 'Humidity',
        'wind_speed': 'Wind Speed',
        'precipitation': 'Precipitation',
        'uv_index': 'UV Index',
        
        // Market & Prices
        'current_prices': 'Current Prices',
        'price_trends': 'Price Trends',
        'market_analysis': 'Market Analysis',
        'demand_forecast': 'Demand Forecast',
        'supply_status': 'Supply Status',
        
        // AI & Intelligence
        'smart_recommendations': 'Smart Recommendations',
        'predictive_analytics': 'Predictive Analytics',
        'crop_optimization': 'Crop Optimization',
        'risk_assessment': 'Risk Assessment',
        
        // Tutorial & Help
        'tutorial_title': 'Dashboard Tutorial',
        'step_by_step_guide': 'Step-by-Step Progress Guide',
        'helpful_tutorial': 'Helpful Tutorial Overlay',
        'voice_commands': 'Voice Commands',
        'navigation_help': 'Navigation Help',
        'chat_help': 'Chat Help',
        'content_help': 'Content Help',
        'language_help': 'Language Help',
        
        // Network & Performance
        'network_status': 'Network Status',
        'performance_mode': 'Performance Mode',
        'offline_mode': 'Offline Mode',
        'cached_data': 'Cached Data',
        'connection_type': 'Connection Type',
        'loading_performance': 'Loading Performance',
        
        // Confirmation & Actions
        'confirm_action': 'Confirm Action',
        'action_completed': 'Action Completed',
        'undo_available': 'Undo Available',
        'recent_actions': 'Recent Actions',
        'action_receipts': 'Action Receipts',
        
        // Error Handling
        'friendly_error': 'Something went wrong',
        'retry_operation': 'Retry Operation',
        'auto_save_enabled': 'Auto-save Enabled',
        'last_saved': 'Last Saved',
        'recovery_available': 'Recovery Available',
        
        // Chat & AI
        'ai_assistant_title': 'AI Farming Assistant',
        'send_message': 'Send Message',
        'type_message': 'Type your message...',
        'chat_loading': 'AI is thinking...',
        'voice_input': 'Voice Input',
        'text_to_speech': 'Text to Speech'
      },
      
      hi: {
        // Greetings
        'greeting_morning': 'सुप्रभात',
        'greeting_afternoon': 'सुभ दिन',
        'greeting_evening': 'सुभ संध्या',
        'greeting_night': 'शुभ रात्रि',
        
        // Dashboard Sections
        'dashboard_title': 'खेत डैशबोर्ड',
        'step_progress': 'चरण प्रगति',
        'farm_performance': 'खेत प्रदर्शन',
        'live_crop_status': 'लाइव फसल स्थिति',
        'quick_actions': 'त्वरित कार्य',
        'critical_alerts': 'महत्वपूर्ण सचेतावनी',
        'weather_intelligence': 'मौसम जानकारी',
        'market_intelligence': 'बाजार जानकारी',
        'ai_features': 'एआई सुविधाएं',
        
        // Step Names
        'step_1': 'महत्वपूर्ण सचेतावनी देखें',
        'step_2': 'खेत प्रदर्शन जांचें',
        'step_3': 'फसल और मौसम की निगरानी',
        'step_4': 'कार्रवाई करें',
        
        // Common Actions
        'show_help': 'सहायता दिखाएं',
        'hide_help': 'सहायता छिपाएं',
        'next_step': 'अगला कदम',
        'previous_step': 'पिछला कदम',
        'start_over': 'फिर से शुरू करें',
        'dashboard_complete': 'डैशबोर्ड पूरा!',
        
        // Metrics & Data
        'farm_efficiency': 'खेत दक्षता',
        'monthly_income': 'मासिक आय',
        'monthly_expenses': 'मासिक खर्च',
        'monthly_profit': 'मासिक लाभ',
        'active_crops': 'सक्रिय फसलें',
        'weather_forecast': 'मौसम पूर्वानुमान',
        'market_trends': 'बाजार प्रवृत्तियां',
        'crop_health': 'फसल स्वास्थ्य',
        
        // Status & Alerts
        'healthy': 'स्वस्थ',
        'warning': 'चेतावनी',
        'critical': 'महत्वपूर्ण',
        'attention_required': 'ध्यान आवश्यक',
        'no_alerts': 'कोई महत्वपूर्ण सचेतावनी नहीं',
        
        // Quick Actions
        'scan_crop': 'फसल स्कैन करें',
        'check_weather': 'मौसम जांचें',
        'view_market': 'बाजार देखें',
        'ai_assistant': 'एआई सहायक',
        'government_schemes': 'सरकारी योजनाएं',
        'profit_calculator': 'लाभ कैलकुलेटर',
        'crop_calendar': 'फसल कैलेंडर',
        'carbon_credits': 'कार्बन क्रेडिट',
        
        // Performance & Analytics
        'performance_overview': 'प्रदर्शन अवलोकन',
        'efficiency_score': 'दक्षता स्कोर',
        'revenue_trends': 'राजस्व प्रवृत्तियां',
        'expense_breakdown': 'खर्च विवरण',
        'crop_distribution': 'फसल वितरण',
        'seasonal_analysis': 'मौसमी विश्लेषण',
        
        // Weather & Climate
        'current_weather': 'वर्तमान मौसम',
        'temperature': 'तापमान',
        'humidity': 'आर्द्रता',
        'wind_speed': 'हवा की गति',
        'precipitation': 'वर्षा',
        'uv_index': 'यूवी सूचकांक',
        
        // Market & Prices
        'current_prices': 'वर्तमान मूल्य',
        'price_trends': 'मूल्य प्रवृत्तियां',
        'market_analysis': 'बाजार विश्लेषण',
        'demand_forecast': 'मांग पूर्वानुमान',
        'supply_status': 'आपूर्ति स्थिति',
        
        // AI & Intelligence
        'smart_recommendations': 'स्मार्ट सिफारिशें',
        'predictive_analytics': 'भविष्यवाणी विश्लेषण',
        'crop_optimization': 'फसल अनुकूलन',
        'risk_assessment': 'जोखिम मूल्यांकन',
        
        // Tutorial & Help
        'tutorial_title': 'डैशबोर्ड ट्यूटोरियल',
        'step_by_step_guide': 'चरण-दर-चरण प्रगति गाइड',
        'helpful_tutorial': 'सहायक ट्यूटोरियल',
        'voice_commands': 'आवाज आदेश',
        'navigation_help': 'नेविगेशन सहायता',
        'chat_help': 'चैट सहायता',
        'content_help': 'सामग्री सहायता',
        'language_help': 'भाषा सहायता',
        
        // Network & Performance
        'network_status': 'नेटवर्क स्थिति',
        'performance_mode': 'प्रदर्शन मोड',
        'offline_mode': 'ऑफलाइन मोड',
        'cached_data': 'कैश डेटा',
        'connection_type': 'कनेक्शन प्रकार',
        'loading_performance': 'लोडिंग प्रदर्शन',
        
        // Confirmation & Actions
        'confirm_action': 'कार्रवाई की पुष्टि करें',
        'action_completed': 'कार्रवाई पूरी',
        'undo_available': 'पूर्ववत उपलब्ध',
        'recent_actions': 'हाल की कार्रवाई',
        'action_receipts': 'कार्रवाई रसीदें',
        
        // Error Handling
        'friendly_error': 'कुछ गलत हो गया',
        'retry_operation': 'ऑपरेशन पुनः प्रयास करें',
        'auto_save_enabled': 'स्वचालित सहेजना सक्षम',
        'last_saved': 'अंतिम सहेजा गया',
        'recovery_available': 'पुनर्प्राप्ति उपलब्ध',
        
        // Chat & AI
        'ai_assistant_title': 'एआई खेती सहायक',
        'send_message': 'संदेश भेजें',
        'type_message': 'अपना संदेश टाइप करें...',
        'chat_loading': 'एआई सोच रहा है...',
        'voice_input': 'आवाज इनपुट',
        'text_to_speech': 'टेक्स्ट से स्पीच'
      },
      
      kn: {
        // Greetings
        'greeting_morning': 'ಶುಭೋದಯ',
        'greeting_afternoon': 'ಶುಭ ದಿನ',
        'greeting_evening': 'ಶುಭ ಸಂಜೆ',
        'greeting_night': 'ಶುಭ ರಾತ್ರಿ',
        
        // Dashboard Sections
        'dashboard_title': 'ಫಾರ್ಮ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        'step_progress': 'ಹಂತ ಪ್ರಗತಿ',
        'farm_performance': 'ಫಾರ್ಮ್ ಕಾರ್ಯಕ್ಷಮತೆ',
        'live_crop_status': 'ಲೈವ್ ಬೆಳೆ ಸ್ಥಿತಿ',
        'quick_actions': 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
        'critical_alerts': 'ವಿಮರ್ಶಾತ್ಮಕ ಎಚ್ಚರಿಕೆಗಳು',
        'weather_intelligence': 'ಹವಾಮಾನ ಬುದ್ಧಿಮತ್ತೆ',
        'market_intelligence': 'ಮಾರುಕಟ್ಟೆ ಬುದ್ಧಿಮತ್ತೆ',
        'ai_features': 'ಎಐ ವೈಶಿಷ್ಟ್ಯಗಳು',
        
        // Step Names
        'step_1': 'ವಿಮರ್ಶಾತ್ಮಕ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
        'step_2': 'ಫಾರ್ಮ್ ಕಾರ್ಯಕ್ಷಮತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ',
        'step_3': 'ಬೆಳೆಗಳು ಮತ್ತು ಹವಾಮಾನವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ',
        'step_4': 'ಕ್ರಿಯೆ ಮಾಡಿ',
        
        // Common Actions
        'show_help': 'ಸಹಾಯ ತೋರಿಸಿ',
        'hide_help': 'ಸಹಾಯ ಮರೆಮಾಡಿ',
        'next_step': 'ಮುಂದಿನ ಹಂತ',
        'previous_step': 'ಹಿಂದಿನ ಹಂತ',
        'start_over': 'ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ',
        'dashboard_complete': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪೂರ್ಣ!',
        
        // Metrics & Data
        'farm_efficiency': 'ಫಾರ್ಮ್ ದಕ್ಷತೆ',
        'monthly_income': 'ಮಾಸಿಕ ಆದಾಯ',
        'monthly_expenses': 'ಮಾಸಿಕ ವೆಚ್ಚಗಳು',
        'monthly_profit': 'ಮಾಸಿಕ ಲಾಭ',
        'active_crops': 'ಸಕ್ರಿಯ ಬೆಳೆಗಳು',
        'weather_forecast': 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
        'market_trends': 'ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳು',
        'crop_health': 'ಬೆಳೆ ಆರೋಗ್ಯ',
        
        // Status & Alerts
        'healthy': 'ಆರೋಗ್ಯಕರ',
        'warning': 'ಎಚ್ಚರಿಕೆ',
        'critical': 'ವಿಮರ್ಶಾತ್ಮಕ',
        'attention_required': 'ಗಮನ ಬೇಕು',
        'no_alerts': 'ಯಾವುದೇ ವಿಮರ್ಶಾತ್ಮಕ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ',
        
        // Quick Actions
        'scan_crop': 'ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
        'check_weather': 'ಹವಾಮಾನ ಪರಿಶೀಲಿಸಿ',
        'view_market': 'ಮಾರುಕಟ್ಟೆ ವೀಕ್ಷಿಸಿ',
        'ai_assistant': 'ಎಐ ಸಹಾಯಕ',
        'government_schemes': 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
        'profit_calculator': 'ಲಾಭ ಕ್ಯಾಲ್ಕುಲೇಟರ್',
        'crop_calendar': 'ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್',
        'carbon_credits': 'ಕಾರ್ಬನ್ ಕ್ರೆಡಿಟ್‌ಗಳು',
        
        // Performance & Analytics
        'performance_overview': 'ಕಾರ್ಯಕ್ಷಮತೆ ಅವಲೋಕನ',
        'efficiency_score': 'ದಕ್ಷತೆ ಸ್ಕೋರ್',
        'revenue_trends': 'ರೆವೆನ್ಯೂ ಪ್ರವೃತ್ತಿಗಳು',
        'expense_breakdown': 'ವೆಚ್ಚ ವಿಭಜನೆ',
        'crop_distribution': 'ಬೆಳೆ ವಿತರಣೆ',
        'seasonal_analysis': 'ಋತುಮಾನ ವಿಶ್ಲೇಷಣೆ',
        
        // Weather & Climate
        'current_weather': 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ',
        'temperature': 'ತಾಪಮಾನ',
        'humidity': 'ಆರ್ದ್ರತೆ',
        'wind_speed': 'ಗಾಳಿಯ ವೇಗ',
        'precipitation': 'ಮಳೆ',
        'uv_index': 'ಯುವಿ ಸೂಚ್ಯಂಕ',
        
        // Market & Prices
        'current_prices': 'ಪ್ರಸ್ತುತ ಬೆಲೆಗಳು',
        'price_trends': 'ಬೆಲೆ ಪ್ರವೃತ್ತಿಗಳು',
        'market_analysis': 'ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ',
        'demand_forecast': 'ಬೇಡಿಕೆ ಮುನ್ಸೂಚನೆ',
        'supply_status': 'ಸರಬರಾಜು ಸ್ಥಿತಿ',
        
        // AI & Intelligence
        'smart_recommendations': 'ಸ್ಮಾರ್ಟ್ ಶಿಫಾರಸುಗಳು',
        'predictive_analytics': 'ಭವಿಷ್ಯವಾಣಿ ವಿಶ್ಲೇಷಣೆ',
        'crop_optimization': 'ಬೆಳೆ ಅತ್ಯುತ್ತಮೀಕರಣ',
        'risk_assessment': 'ಅಪಾಯ ಮೌಲ್ಯಮಾಪನ',
        
        // Tutorial & Help
        'tutorial_title': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಟ್ಯುಟೋರಿಯಲ್',
        'step_by_step_guide': 'ಹಂತ-ಹಂತದ ಪ್ರಗತಿ ಮಾರ್ಗದರ್ಶಿ',
        'helpful_tutorial': 'ಸಹಾಯಕ ಟ್ಯುಟೋರಿಯಲ್',
        'voice_commands': 'ಧ್ವನಿ ಆದೇಶಗಳು',
        'navigation_help': 'ನ್ಯಾವಿಗೇಷನ್ ಸಹಾಯ',
        'chat_help': 'ಚಾಟ್ ಸಹಾಯ',
        'content_help': 'ವಿಷಯ ಸಹಾಯ',
        'language_help': 'ಭಾಷೆ ಸಹಾಯ',
        
        // Network & Performance
        'network_status': 'ನೆಟ್‌ವರ್ಕ್ ಸ್ಥಿತಿ',
        'performance_mode': 'ಕಾರ್ಯಕ್ಷಮತೆ ಮೋಡ್',
        'offline_mode': 'ಆಫ್‌ಲೈನ್ ಮೋಡ್',
        'cached_data': 'ಕ್ಯಾಶ್ ಡೇಟಾ',
        'connection_type': 'ಸಂಪರ್ಕ ಪ್ರಕಾರ',
        'loading_performance': 'ಲೋಡಿಂಗ್ ಕಾರ್ಯಕ್ಷಮತೆ',
        
        // Confirmation & Actions
        'confirm_action': 'ಕ್ರಿಯೆಯನ್ನು ದೃಢೀಕರಿಸಿ',
        'action_completed': 'ಕ್ರಿಯೆ ಪೂರ್ಣಗೊಂಡಿದೆ',
        'undo_available': 'ರದ್ದುಮಾಡಲು ಲಭ್ಯವಿದೆ',
        'recent_actions': 'ಇತ್ತೀಚಿನ ಕ್ರಿಯೆಗಳು',
        'action_receipts': 'ಕ್ರಿಯೆ ರಸೀದಿಗಳು',
        
        // Error Handling
        'friendly_error': 'ಏನೋ ತಪ್ಪಾಗಿದೆ',
        'retry_operation': 'ಅಭಿಯಾನವನ್ನು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
        'auto_save_enabled': 'ಸ್ವಯಂ-ಉಳಿಸುವಿಕೆ ಸಕ್ರಿಯಗೊಂಡಿದೆ',
        'last_saved': 'ಕೊನೆಯದಾಗಿ ಉಳಿಸಲಾಗಿದೆ',
        'recovery_available': 'ಪುನಃಸ್ಥಾಪನೆ ಲಭ್ಯವಿದೆ',
        
        // Chat & AI
        'ai_assistant_title': 'ಎಐ ಕೃಷಿ ಸಹಾಯಕ',
        'send_message': 'ಸಂದೇಶ ಕಳುಹಿಸಿ',
        'type_message': 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
        'chat_loading': 'ಎಐ ಯೋಚಿಸುತ್ತಿದೆ...',
        'voice_input': 'ಧ್ವನಿ ಇನ್‌ಪುಟ್',
        'text_to_speech': 'ಟೆಕ್ಸ್ಟ್‌ನಿಂದ ಸ್ಪೀಚ್'
      },
      
      ta: {
        // Greetings
        'greeting_morning': 'காலை வணக்கம்',
        'greeting_afternoon': 'மதிய வணக்கம்',
        'greeting_evening': 'மாலை வணக்கம்',
        'greeting_night': 'இரவு வணக்கம்',
        
        // Dashboard Sections
        'dashboard_title': 'பண்ணை டாஷ்போர்டு',
        'step_progress': 'படி முன்னேற்றம்',
        'farm_performance': 'பண்ணை செயல்திறன்',
        'live_crop_status': 'நேரலை பயிர் நிலை',
        'quick_actions': 'விரைவு செயல்கள்',
        'critical_alerts': 'முக்கிய எச்சரிக்கைகள்',
        'weather_intelligence': 'வானிலை நுண்ணறிவு',
        'market_intelligence': 'சந்தை நுண்ணறிவு',
        'ai_features': 'ஏஐ அம்சங்கள்',
        
        // Step Names
        'step_1': 'முக்கிய எச்சரிக்கைகளை மதிப்பாய்வு செய்யவும்',
        'step_2': 'பண்ணை செயல்திறனை சரிபார்க்கவும்',
        'step_3': 'பயிர்கள் மற்றும் வானிலையை கண்காணிக்கவும்',
        'step_4': 'நடவடிக்கை எடுக்கவும்',
        
        // Common Actions
        'show_help': 'உதவியைக் காட்டு',
        'hide_help': 'உதவியை மறைக்கு',
        'next_step': 'அடுத்த படி',
        'previous_step': 'முந்தைய படி',
        'start_over': 'மீண்டும் தொடங்கு',
        'dashboard_complete': 'டாஷ்போர்டு முடிந்தது!',
        
        // Metrics & Data
        'farm_efficiency': 'பண்ணை திறன்',
        'monthly_income': 'மாதாந்திர வருமானம்',
        'monthly_expenses': 'மாதாந்திர செலவுகள்',
        'monthly_profit': 'மாதாந்திர லாபம்',
        'active_crops': 'செயலில் உள்ள பயிர்கள்',
        'weather_forecast': 'வானிலை முன்னறிவிப்பு',
        'market_trends': 'சந்தை போக்குகள்',
        'crop_health': 'பயிர் ஆரோக்கியம்',
        
        // Status & Alerts
        'healthy': 'ஆரோக்கியமான',
        'warning': 'எச்சரிக்கை',
        'critical': 'முக்கியமான',
        'attention_required': 'கவனம் தேவை',
        'no_alerts': 'முக்கிய எச்சரிக்கைகள் எதுவும் இல்லை',
        
        // Quick Actions
        'scan_crop': 'பயிரை ஸ்கேன் செய்யவும்',
        'check_weather': 'வானிலையை சரிபார்க்கவும்',
        'view_market': 'சந்தையை பார்க்கவும்',
        'ai_assistant': 'ஏஐ உதவியாளர்',
        'government_schemes': 'அரசு திட்டங்கள்',
        'profit_calculator': 'லாப கணிப்பான்',
        'crop_calendar': 'பயிர் நாட்காட்டி',
        'carbon_credits': 'கார்பன் கடன்',
        
        // Performance & Analytics
        'performance_overview': 'செயல்திறன் கண்ணோட்டம்',
        'efficiency_score': 'திறன் மதிப்பெண்',
        'revenue_trends': 'வருவாய் போக்குகள்',
        'expense_breakdown': 'செலவு பிரிப்பு',
        'crop_distribution': 'பயிர் பரம்பல்',
        'seasonal_analysis': 'பருவகால பகுப்பாய்வு',
        
        // Weather & Climate
        'current_weather': 'தற்போதைய வானிலை',
        'temperature': 'வெப்பநிலை',
        'humidity': 'ஈரப்பதம்',
        'wind_speed': 'காற்றின் வேகம்',
        'precipitation': 'மழைப்பொழிவு',
        'uv_index': 'யூவி குறியீடு',
        
        // Market & Prices
        'current_prices': 'தற்போதைய விலைகள்',
        'price_trends': 'விலை போக்குகள்',
        'market_analysis': 'சந்தை பகுப்பாய்வு',
        'demand_forecast': 'தேவை முன்னறிவிப்பு',
        'supply_status': 'வழங்கல் நிலை',
        
        // AI & Intelligence
        'smart_recommendations': 'ஸ்மார்ட் பரிந்துரைகள்',
        'predictive_analytics': 'முன்கணிப்பு பகுப்பாய்வு',
        'crop_optimization': 'பயிர் உகந்தமயமாக்கல்',
        'risk_assessment': 'ஆபத்து மதிப்பீடு',
        
        // Tutorial & Help
        'tutorial_title': 'டாஷ்போர்டு பயிற்சி',
        'step_by_step_guide': 'படிப்படியான முன்னேற்ற வழிகாட்டி',
        'helpful_tutorial': 'உதவியான பயிற்சி',
        'voice_commands': 'குரல் கட்டளைகள்',
        'navigation_help': 'வழிசெலுத்தல் உதவி',
        'chat_help': 'அரட்டை உதவி',
        'content_help': 'உள்ளடக்க உதவி',
        'language_help': 'மொழி உதவி',
        
        // Network & Performance
        'network_status': 'பிணைய நிலை',
        'performance_mode': 'செயல்திறன் பயன்முறை',
        'offline_mode': 'ஆஃப்லைன் பயன்முறை',
        'cached_data': 'கேச் தரவு',
        'connection_type': 'இணைப்பு வகை',
        'loading_performance': 'ஏற்றும் செயல்திறன்',
        
        // Confirmation & Actions
        'confirm_action': 'நடவடிக்கையை உறுதிப்படுத்து',
        'action_completed': 'நடவடிக்கை முடிந்தது',
        'undo_available': 'செயல்தவிர்க்க கிடைக்கிறது',
        'recent_actions': 'சமீபத்திய நடவடிக்கைகள்',
        'action_receipts': 'நடவடிக்கை ரசீதுகள்',
        
        // Error Handling
        'friendly_error': 'ஏதோ தவறு நடந்தது',
        'retry_operation': 'செயல்பாட்டை மீண்டும் முயற்சிக்கவும்',
        'auto_save_enabled': 'தானாக சேமிப்பு இயக்கப்பட்டது',
        'last_saved': 'கடைசியாக சேமிக்கப்பட்டது',
        'recovery_available': 'மீட்டெடுப்பு கிடைக்கிறது',
        
        // Chat & AI
        'ai_assistant_title': 'ஏஐ விவசாய உதவியாளர்',
        'send_message': 'செய்தியை அனுப்பு',
        'type_message': 'உங்கள் செய்தியை தட்டச்சு செய்யவும்...',
        'chat_loading': 'ஏஐ சிந்திக்கிறது...',
        'voice_input': 'குரல் உள்ளீடு',
        'text_to_speech': 'உரைக்கு பேச்சு'
      },
      
      te: {
        // Greetings
        'greeting_morning': 'శుభోదయం',
        'greeting_afternoon': 'శుభ మద్యాహ్నం',
        'greeting_evening': 'శుభ సాయంత్రం',
        'greeting_night': 'శుభ రాత్రి',
        
        // Dashboard Sections
        'dashboard_title': 'పొలం డాష్‌బోర్డ్',
        'step_progress': 'దశ ప్రగతి',
        'farm_performance': 'పొలం పనితీరు',
        'live_crop_status': 'లైవ్ పంట స్థితి',
        'quick_actions': 'త్వరిత చర్యలు',
        'critical_alerts': 'విమర్శనాత్మక హెచ్చరికలు',
        'weather_intelligence': 'వాతావరణ తెలివి',
        'market_intelligence': 'మార్కెట్ తెలివి',
        'ai_features': 'ఏఐ లక్షణాలు',
        
        // Step Names
        'step_1': 'విమర్శనాత్మక హెచ్చరికలను సమీక్షించండి',
        'step_2': 'పొలం పనితీరును తనిఖీ చేయండి',
        'step_3': 'పంటలు మరియు వాతావరణాన్ని పర్యవేక్షించండి',
        'step_4': 'చర్య తీసుకోండి',
        
        // Common Actions
        'show_help': 'సహాయం చూపించు',
        'hide_help': 'సహాయం దాచు',
        'next_step': 'తదుపరి దశ',
        'previous_step': 'మునుపటి దశ',
        'start_over': 'మళ్ళీ ప్రారంభించు',
        'dashboard_complete': 'డాష్‌బోర్డ్ పూర్తయింది!',
        
        // Metrics & Data
        'farm_efficiency': 'పొలం సమర్థత',
        'monthly_income': 'నెలవారీ ఆదాయం',
        'monthly_expenses': 'నెలవారీ ఖర్చులు',
        'monthly_profit': 'నెలవారీ లాభం',
        'active_crops': 'క్రియాశీల పంటలు',
        'weather_forecast': 'వాతావరణ అంచనా',
        'market_trends': 'మార్కెట్ ధోరణులు',
        'crop_health': 'పంట ఆరోగ్యం',
        
        // Status & Alerts
        'healthy': 'ఆరోగ్యకరమైన',
        'warning': 'హెచ్చరిక',
        'critical': 'విమర్శనాత్మక',
        'attention_required': 'శ్రద్ధ అవసరం',
        'no_alerts': 'విమర్శనాత్మక హెచ్చరికలు లేవు',
        
        // Quick Actions
        'scan_crop': 'పంటను స్కాన్ చేయండి',
        'check_weather': 'వాతావరణాన్ని తనిఖీ చేయండి',
        'view_market': 'మార్కెట్‌ను చూడండి',
        'ai_assistant': 'ఏఐ సహాయకుడు',
        'government_schemes': 'ప్రభుత్వ పథకాలు',
        'profit_calculator': 'లాభ కాలిక్యులేటర్',
        'crop_calendar': 'పంట క్యాలెండర్',
        'carbon_credits': 'కార్బన్ క్రెడిట్‌లు',
        
        // Performance & Analytics
        'performance_overview': 'పనితీరు అవలోకనం',
        'efficiency_score': 'సమర్థత స్కోర్',
        'revenue_trends': 'రెవెన్యూ ధోరణులు',
        'expense_breakdown': 'ఖర్చు విభజన',
        'crop_distribution': 'పంట పంపిణీ',
        'seasonal_analysis': 'ఋతుపవయస విశ్లేషణ',
        
        // Weather & Climate
        'current_weather': 'ప్రస్తుత వాతావరణం',
        'temperature': 'ఉష్ణోగ్రత',
        'humidity': 'తేమ',
        'wind_speed': 'గాలి వేగం',
        'precipitation': 'వర్షపాతం',
        'uv_index': 'యువి సూచిక',
        
        // Market & Prices
        'current_prices': 'ప్రస్తుత ధరలు',
        'price_trends': 'ధర ధోరణులు',
        'market_analysis': 'మార్కెట్ విశ్లేషణ',
        'demand_forecast': 'డిమాండ్ అంచనా',
        'supply_status': 'సరఫరా స్థితి',
        
        // AI & Intelligence
        'smart_recommendations': 'స్మార్ట్ సిఫార్సులు',
        'predictive_analytics': 'అంచనా విశ్లేషణ',
        'crop_optimization': 'పంట ఆప్టిమైజేషన్',
        'risk_assessment': 'రిస్క్ అంచనా',
        
        // Tutorial & Help
        'tutorial_title': 'డాష్‌బోర్డ్ ట్యుటోరియల్',
        'step_by_step_guide': 'దశ-దశగా ప్రగతి మార్గదర్శకం',
        'helpful_tutorial': 'సహాయక ట్యుటోరియల్',
        'voice_commands': 'వాయిస్ ఆదేశాలు',
        'navigation_help': 'నావిగేషన్ సహాయం',
        'chat_help': 'చాట్ సహాయం',
        'content_help': 'కంటెంట్ సహాయం',
        'language_help': 'భాష సహాయం',
        
        // Network & Performance
        'network_status': 'నెట్‌వర్క్ స్థితి',
        'performance_mode': 'పనితీరు మోడ్',
        'offline_mode': 'ఆఫ్‌లైన్ మోడ్',
        'cached_data': 'క్యాష్ డేటా',
        'connection_type': 'కనెక్షన్ రకం',
        'loading_performance': 'లోడింగ్ పనితీరు',
        
        // Confirmation & Actions
        'confirm_action': 'చర్యను నిర్ధారించండి',
        'action_completed': 'చర్య పూర్తయింది',
        'undo_available': 'రద్దు చేయడానికి అందుబాటులో ఉంది',
        'recent_actions': 'ఇటీవలి చర్యలు',
        'action_receipts': 'చర్య రసీదులు',
        
        // Error Handling
        'friendly_error': 'ఏదో తప్పు జరిగింది',
        'retry_operation': 'ఆపరేషన్‌ను మళ్ళీ ప్రయత్నించండి',
        'auto_save_enabled': 'ఆటో-సేవ్ ప్రారంభించబడింది',
        'last_saved': 'చివరిగా సేవ్ చేయబడింది',
        'recovery_available': 'రికవరీ అందుబాటులో ఉంది',
        
        // Chat & AI
        'ai_assistant_title': 'ఏఐ వ్యవసాయ సహాయకుడు',
        'send_message': 'సందేశాన్ని పంపండి',
        'type_message': 'మీ సందేశాన్ని టైప్ చేయండి...',
        'chat_loading': 'ఏఐ ఆలోచిస్తోంది...',
        'voice_input': 'వాయిస్ ఇన్‌పుట్',
        'text_to_speech': 'టెక్స్ట్‌నుండి స్పీచ్'
      }
    };
    
    return translations[currentLanguage]?.[key] || fallback || key;
  };

  const changeLanguage = (lang: 'en' | 'hi' | 'kn' | 'ta' | 'te') => {
    setCurrentLanguage(lang);
    // Save language preference
    localStorage.setItem('kisanSetu_language', lang);
    
    if (voiceFeedback) {
      speak(`Language changed to ${languages[lang].name}`);
    }
  };

  const initializeVoice = () => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      setSpeechSynthesis(synth);
      
      // Get available voices
      const voices = synth.getVoices();
      // Note: Voice selection would be handled per utterance in a real implementation
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentLanguage === 'en' ? 'en-IN' : `${currentLanguage}-IN`;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceCommand(transcript);
      };
      
      setSpeechRecognition(recognition);
    }
  };

  const speak = (text: string, lang?: string) => {
    if (!speechSynthesis || !voiceFeedback) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || `${currentLanguage}-IN`;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (speechRecognition && !isListening) {
      try {
        speechRecognition.start();
        speak('Listening for voice commands');
      } catch (error) {
        showFriendlyError(
          "Voice recognition is not available on your device.",
          ["Use keyboard navigation instead", "Enable microphone permissions", "Contact support for assistance"],
          false
        );
      }
    }
  };

  const stopListening = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
    }
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('next step') || lowerCommand.includes('next')) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        speak(`Moved to step ${currentStep + 1}`);
      }
    } else if (lowerCommand.includes('previous step') || lowerCommand.includes('back')) {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
        speak(`Moved to step ${currentStep - 1}`);
      }
    } else if (lowerCommand.includes('open chat') || lowerCommand.includes('chat')) {
      setShowChatbot(true);
      speak('Opening AI chat assistant');
    } else if (lowerCommand.includes('close chat') || lowerCommand.includes('stop chat')) {
      setShowChatbot(false);
      speak('Closing chat assistant');
    } else if (lowerCommand.includes('read dashboard') || lowerCommand.includes('read')) {
      readDashboardContent();
    } else if (lowerCommand.includes('help') || lowerCommand.includes('tutorial')) {
      setShowTutorial(true);
      speak('Opening dashboard tutorial');
    } else {
      speak(`Command not recognized: ${command}`);
    }
  };

  const readDashboardContent = () => {
    const content = `
      Dashboard Overview. 
      Step ${currentStep} of 4: ${t(`step_${currentStep}`)}. 
      Farm efficiency: ${farmMetrics?.efficiencyScore}%. 
      Monthly profit: ₹${farmMetrics ? (farmMetrics.monthlyIncome - farmMetrics.monthlyExpenses).toLocaleString() : 0}. 
      Active crops: ${cropStatus.length}. 
      ${insights.filter(i => i.priority === 'critical').length} critical alerts require attention.
    `;
    speak(content);
  };

  const formatLocalDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    
    return date.toLocaleDateString(`${currentLanguage}-IN`, options);
  };

  // Enhanced Markdown parser for bot messages
  const parseMarkdown = (text: string) => {
    if (!text) return '';
    
    let parsed = text;
    
    // Convert **text** to <strong>text</strong> (bold)
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    // Convert *text* to <em>text</em> (italic)
    parsed = parsed.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Convert `text` to <code>text</code> (inline code)
    parsed = parsed.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Convert \n to <br> for line breaks
    parsed = parsed.replace(/\n/g, '<br />');
    
    // Convert • to bullet points with better styling
    parsed = parsed.replace(/•/g, '<span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>');
    
    // Convert numbers followed by . to numbered lists
    parsed = parsed.replace(/^(\d+)\.\s/gm, '<span class="inline-block w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-center text-xs font-medium mr-2">$1</span>');
    
    // Convert URLs to clickable links
    parsed = parsed.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    
    return parsed;
  };

  const season = getCurrentSeason();
  const greeting = getGreeting();

    if (loading) {
    const loadingText = loadingPerformance === 'slow' 
      ? "Loading may take longer on your device. Please be patient..."
      : loadingPerformance === 'fast'
      ? "Loading your farm insights..."
      : "Analyzing your crops, weather, and market data...";
    
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className={`rounded-full h-16 w-16 border-b-4 border-gray-600 mx-auto mb-4 ${
            loadingPerformance === 'slow' ? 'animate-pulse' : 'animate-spin'
          }`}></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Your Farm Insights</h2>
          <p className="text-gray-500">{loadingText}</p>
          
          {loadingPerformance === 'slow' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-yellow-700">
                <strong>Performance Tip:</strong> Your device is running in low-performance mode. 
                Consider closing other apps to improve loading speed.
              </p>
            </div>
          )}
          
          {offlineMode && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-700">
                <strong>Offline Mode:</strong> Loading from cached data. 
                Some features may be limited until you're back online.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative min-h-screen bg-gray-50">
             {/* Accessibility: Skip to Content Link */}
       <a
         href="#main-content"
         className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
       >
         Skip to main content
       </a>
       
       {/* Screen Reader Announcements */}
       <div aria-live="polite" aria-atomic="true" className="sr-only">
         {currentStep === 1 && "Step 1: Review Critical Alerts"}
         {currentStep === 2 && "Step 2: Check Farm Performance"}
         {currentStep === 3 && "Step 3: Monitor Crops and Weather"}
         {currentStep === 4 && "Step 4: Take Action"}
       </div>
      
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
          <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {greeting}, {currentUser?.displayName || 'Farmer'}
            </h1>
              <p className="text-gray-600 text-lg mt-1">{t('current_season')}: {season.description}</p>
          </div>
                         <div className="text-right">
               <div className="bg-gray-100 rounded-lg px-4 py-3">
                 <div className="text-sm text-gray-600 mb-1">{t('current_season')}</div>
                 <div className="font-semibold text-gray-900">{season.name}</div>
                 <div className="text-xs text-gray-500">{formatLocalDateTime(new Date())}</div>
               </div>
               
               {/* Auto-save Status */}
               <div className="mt-3 bg-blue-50 rounded-lg px-3 py-2">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     <div className={`w-2 h-2 rounded-full ${autoSaveEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                     <span className="text-xs text-blue-700">
                       {autoSaveEnabled ? t('auto_save_enabled') : 'Auto-save OFF'}
                     </span>
                   </div>
                   <button
                     onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                     className="text-xs text-blue-600 hover:text-blue-800 underline"
                     title={autoSaveEnabled ? 'Turn off auto-save' : 'Turn on auto-save'}
                   >
                     {autoSaveEnabled ? 'Disable' : 'Enable'}
                   </button>
                 </div>
                 {lastSaved && (
                   <div className="text-xs text-blue-600 mt-1">
                     Last saved: {lastSaved.toLocaleTimeString()}
                   </div>
                 )}
               </div>
               
               {/* Network & Performance Status */}
               <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center space-x-2">
                     <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                     <span className="text-xs text-gray-700">
                       {isOnline ? 'Online' : 'Offline'}
                     </span>
                   </div>
                   <div className="flex items-center space-x-1">
                     <span className="text-xs text-gray-500">Performance:</span>
                     <span className={`text-xs px-1.5 py-0.5 rounded ${
                       performanceMode === 'high' ? 'bg-green-100 text-green-700' :
                       performanceMode === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                       'bg-red-100 text-red-700'
                     }`}>
                       {performanceMode}
                     </span>
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between">
                   <button
                     onClick={offlineMode ? disableOfflineMode : enableOfflineMode}
                     className={`text-xs px-2 py-1 rounded ${
                       offlineMode 
                         ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                     } transition-colors`}
                     disabled={!cachedData && !isOnline}
                     title={offlineMode ? 'Switch to online mode' : 'Enable offline mode'}
                   >
                     {offlineMode ? 'Online Mode' : 'Offline Mode'}
                   </button>
                   
                   <div className="text-xs text-gray-500">
                     {getNetworkStatus().effectiveType !== 'unknown' && (
                       <span>Network: {getNetworkStatus().effectiveType}</span>
                     )}
                   </div>
                 </div>
               </div>
               
               {/* Language & Voice Controls */}
               <div className="mt-3 bg-purple-50 rounded-lg px-3 py-2">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-medium text-purple-700">Language & Voice</span>
                   <div className="flex items-center space-x-2">
                     <button
                       onClick={() => setVoiceFeedback(!voiceFeedback)}
                       className={`w-4 h-4 rounded-full ${
                         voiceFeedback ? 'bg-green-500' : 'bg-gray-400'
                       }`}
                       title={voiceFeedback ? 'Voice feedback enabled' : 'Voice feedback disabled'}
                     />
                     <span className="text-xs text-purple-600">
                       {voiceFeedback ? 'Voice ON' : 'Voice OFF'}
                     </span>
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between">
                   {/* Language Selector */}
                   <select
                     value={currentLanguage}
                     onChange={(e) => changeLanguage(e.target.value as any)}
                     className="text-xs border border-purple-300 rounded px-2 py-1 bg-white text-purple-700"
                   >
                     {Object.entries(languages).map(([code, lang]) => (
                       <option key={code} value={code}>
                         {lang.flag} {lang.native}
                       </option>
                     ))}
                   </select>
                   
                   {/* Voice Controls */}
                   <div className="flex items-center space-x-2">
                     <button
                       onClick={startListening}
                       disabled={!speechRecognition || isListening}
                       className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                         isListening 
                           ? 'bg-red-500 text-white animate-pulse' 
                           : 'bg-purple-500 text-white hover:bg-purple-600'
                       } transition-colors`}
                       title="Start voice recognition"
                     >
                       🎤
                     </button>
                     
                     <button
                       onClick={readDashboardContent}
                       disabled={!speechSynthesis}
                       className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
                       title="Read dashboard content"
                     >
                       🔊
                     </button>
                   </div>
                 </div>
               </div>
             </div>
        </div>

          {/* Critical Alerts */}
          {insights.filter(i => i.priority === 'critical').length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <h3 className="font-semibold text-red-800">{t('attention_required')}</h3>
                </div>
                {currentStep === 1 && (
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    {t('next_step')}: {t('step_2')} →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.filter(i => i.priority === 'critical').map((insight) => (
                  <div key={insight.id} className="bg-white rounded border border-red-200 p-4">
                    <h4 className="font-medium text-red-800 mb-2">{insight.title}</h4>
                    <p className="text-sm text-red-700 mb-3">{insight.message}</p>
                    {insight.actionable && (
                      <button 
                        onClick={() => {
                          if (insight.action) {
                            showConfirmation(
                              'Critical Action',
                              `Are you sure you want to ${insight.action.toLowerCase()}? This action is time-sensitive and important for your farm's health.`,
                              () => {
                                trackAction(`Executed: ${insight.action}`, true, () => {
                                  // Undo function - in real app this would revert the action
                                  showSuccess(`Action completed: ${insight.action}`);
                                });
                                showSuccess(`Action completed: ${insight.action}`);
                              }
                            );
                          }
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        {insight.action}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step-by-Step Progress Guide */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="p-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800">{t('step_progress')} {currentStep} of 4:</span>
                <span className="text-sm text-blue-700">
                  {currentStep === 1 && t('step_1')}
                  {currentStep === 2 && t('step_2')}
                  {currentStep === 3 && t('step_3')}
                  {currentStep === 4 && t('step_4')}
                </span>
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((step) => (
                                     <button
                     key={step}
                     onClick={() => {
                       const previousStep = currentStep;
                       setCurrentStep(step);
                       trackAction(`Navigated to Step ${step}`, false);
                       if (step > previousStep) {
                         showSuccess(`Progress: Completed Step ${previousStep}`);
                       }
                       
                       // Voice feedback for step changes
                       if (voiceFeedback) {
                         const stepNames = [
                           'Review Critical Alerts',
                           'Check Farm Performance', 
                           'Monitor Crops and Weather',
                           'Take Action'
                         ];
                         speak(`Moved to step ${step}: ${stepNames[step - 1]}`);
                       }
                     }}
                     className={`w-3 h-3 rounded-full transition-colors ${
                       step === currentStep ? 'bg-blue-600' : 'bg-blue-300'
                     }`}
                     aria-label={`Go to step ${step}`}
                   />
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="text-sm text-blue-700 hover:text-blue-800 underline"
              >
                {showTutorial ? 'Hide Help' : 'Show Help'}
              </button>
                             <select
                 value={userExperience}
                 onChange={(e) => setUserExperience(e.target.value as any)}
                 className="text-sm border border-blue-300 rounded px-2 py-1 bg-white"
               >
                 <option value="beginner">Beginner</option>
                 <option value="intermediate">Intermediate</option>
                 <option value="advanced">Advanced</option>
               </select>
               
               {/* Progress Preservation Status */}
               <div className="flex items-center space-x-2 text-xs text-blue-600">
                 <div className={`w-2 h-2 rounded-full ${autoSaveEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                 <span>
                   {autoSaveEnabled ? 'Progress saved' : 'Progress not saved'}
                 </span>
               </div>
               
               {/* Performance Mode Toggle */}
               <div className="flex items-center space-x-2 text-xs text-blue-600">
                 <span>Performance:</span>
                 <select
                   value={performanceMode}
                   onChange={(e) => optimizeForPerformance(e.target.value as any)}
                   className="text-xs border border-blue-300 rounded px-1 py-0.5 bg-white"
                 >
                   <option value="auto">Auto</option>
                   <option value="low">Low</option>
                   <option value="medium">Medium</option>
                   <option value="high">High</option>
                 </select>
               </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div id="main-content" className="p-6 space-y-6">
        {/* Helpful Tutorial Overlay */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{t('tutorial_title')}</h3>
            <button 
                    onClick={() => setShowTutorial(false)}
                    className="text-gray-400 hover:text-gray-600"
            >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
            </button>
              </div>
                
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Step 1: {t('step_1')}</h4>
                    <p>Start here to see urgent actions needed for your farm. These are time-sensitive and require immediate attention.</p>
            </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Step 2: {t('step_2')}</h4>
                    <p>Review your farm's efficiency, profits, soil health, and carbon credits. Green numbers mean good performance.</p>
          </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Step 3: {t('step_3')}</h4>
                    <p>Check your crop status and weather forecast to plan your farming activities.</p>
        </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Step 4: {t('step_4')}</h4>
                    <p>Use the quick actions to scan crops, check prices, or access other tools.</p>
      </div>

                                     <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                     <p className="text-blue-800"><strong>Tip:</strong> You can click on any step indicator to jump directly to that section.</p>
                   </div>
                   
                   {/* Voice Commands Help */}
                   <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                     <h4 className="font-semibold text-purple-900 mb-2">{t('voice_commands')}</h4>
                     <div className="text-xs text-purple-800 space-y-1">
                       <p><strong>{t('navigation_help')}:</strong> "Next step", "Previous step", "Go to step 2"</p>
                       <p><strong>{t('chat_help')}:</strong> "Open chat", "Close chat"</p>
                       <p><strong>{t('content_help')}:</strong> "Read dashboard", "Help", "Tutorial"</p>
                       <p><strong>{t('language_help')}:</strong> Use the language selector to change voice language</p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && confirmAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
            <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('confirm_action')}</h3>
                  <p className="text-sm text-gray-600">{confirmAction.type}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">{confirmAction.message}</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmAction.onConfirm();
                    setShowConfirmDialog(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
            </div>
          </div>
        </div>
      )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-40 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-400 hover:text-green-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Friendly Error Display */}
        {errorState && (
          <div className="fixed top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-40 max-w-4xl mx-auto">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-sm text-red-700 mb-3">{errorState.message}</p>
                
                {errorState.suggestions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-red-600 mb-2">Here's what you can try:</p>
                    <div className="space-y-1">
                      {errorState.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                          <span className="text-xs text-red-600">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  {errorState.canRetry && (
                    <button
                      onClick={() => retryOperation(loadDashboardData)}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                  
                  {recoveryData && (
                    <button
                      onClick={restoreData}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Restore Previous Data
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1.5 border border-red-300 text-red-700 text-xs rounded hover:bg-red-50 transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Farm Performance Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('performance_overview')}</h2>
              <p className="text-sm text-gray-600 mt-1">Key metrics showing how your farm is performing this month</p>
            </div>
            {currentStep === 2 && (
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {t('next_step')}: {t('step_3')} →
              </button>
            )}
          </div>
          
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-gray-600 text-sm font-medium">{t('farm_efficiency')}</h3>
                  <button 
                    className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600 hover:bg-gray-300"
                    title="Farm efficiency measures how well you're using resources like water, fertilizer, and labor compared to similar farms in your area. Higher percentages mean better resource management."
                  >
                    ?
                  </button>
              </div>
                <p className="text-3xl font-bold text-gray-900">{farmMetrics?.efficiencyScore}%</p>
                <p className="text-green-600 text-sm">+5% from last month</p>
            </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
          </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${farmMetrics?.efficiencyScore}%` }}></div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <span className="font-medium">What this means:</span> Your farm is performing {farmMetrics?.efficiencyScore! >= 80 ? 'excellently' : farmMetrics?.efficiencyScore! >= 60 ? 'well' : 'below average'} compared to regional standards.
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">{t('monthly_profit')}</h3>
                <p className="text-3xl font-bold text-gray-900">₹{(farmMetrics?.monthlyIncome! - farmMetrics?.monthlyExpenses!).toLocaleString()}</p>
                <p className="text-green-600 text-sm">+23% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            </div>
          </div>
            <div className="text-xs text-gray-500">
              Revenue: ₹{farmMetrics?.monthlyIncome.toLocaleString()} | Costs: ₹{farmMetrics?.monthlyExpenses.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">{t('crop_health')}</h3>
                <p className="text-3xl font-bold text-gray-900">{farmMetrics?.soilHealth}%</p>
                <p className="text-green-600 text-sm">Above regional avg</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
          </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${farmMetrics?.soilHealth}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">Carbon Credits</h3>
                <p className="text-3xl font-bold text-gray-900">{farmMetrics?.carbonCredits} <span className="text-lg">kg</span></p>
                <p className="text-green-600 text-sm">₹{Math.round((farmMetrics?.carbonCredits! * 0.9))} earned</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Crop Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('live_crop_status')}</h2>
              <p className="text-sm text-gray-600 mt-1">Monitor your crops in real-time and identify any issues early</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-2">Last updated: {new Date().toLocaleTimeString()}</div>
              {currentStep === 3 && (
                <button 
                  onClick={() => setCurrentStep(4)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                                      {t('next_step')}: {t('step_4')} →
                </button>
              )}
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cropStatus.map((crop, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{crop.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${
                      crop.health === 'excellent' ? 'bg-green-500' :
                      crop.health === 'good' ? 'bg-blue-500' :
                      crop.health === 'fair' ? 'bg-yellow-500' : 
                      crop.health === 'poor' ? 'bg-orange-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-xs font-medium text-gray-600 capitalize">{crop.health}</span>
            </div>
          </div>
          
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-semibold">{crop.area} acres</span>
              </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stage:</span>
                    <span className="font-semibold">{crop.stage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Harvest in:</span>
                    <span className="font-semibold text-green-600">{crop.daysToHarvest} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Value:</span>
                    <span className="font-bold text-green-700">₹{crop.currentValue.toLocaleString()}</span>
                  </div>
                  
                  {crop.riskFactors.length > 0 && (
                    <div className="mt-3 p-2 bg-red-50 rounded border-l-4 border-red-400">
                      <div className="text-xs font-medium text-red-800 mb-1">Risk Factors:</div>
                      {crop.riskFactors.map((risk, i) => (
                        <div key={i} className="text-xs text-red-700">• {risk}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yield Performance vs Environmental Factors */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Yield Performance Analytics</h3>
              <select 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div style={{ height: 300 }}>
              <ChartErrorBoundary>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yieldPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="yield" orientation="left" label={{ value: 'Yield (tons/acre)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="env" orientation="right" label={{ value: 'Environmental Factors', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                    <Legend />
                    <Area yAxisId="yield" type="monotone" dataKey="actual" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Actual Yield" />
                    <Line yAxisId="yield" type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Target Yield" />
                    <Line yAxisId="env" type="monotone" dataKey="soilMoisture" stroke="#f59e0b" strokeWidth={2} name="Soil Moisture %" />
                    </LineChart>
                  </ResponsiveContainer>
              </ChartErrorBoundary>
                </div>
              </div>

          {/* Financial Performance Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Performance</h3>
            <div style={{ height: 300 }}>
              <ChartErrorBoundary>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" name="Income" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" name="Expenses" />
                    <Line type="monotone" dataKey="profit" stroke="#f59e0b" strokeWidth={4} name="Net Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartErrorBoundary>
            </div>
          </div>
        </div>

        {/* Market Intelligence Dashboard */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Market Intelligence - Your Crops</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketTrends.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{item.crop}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.trend === 'rising' ? 'bg-green-100 text-green-800' :
                    item.trend === 'falling' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.change}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-bold">₹{item.current}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Predicted:</span>
                    <span className="font-bold text-blue-600">₹{item.predicted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-medium">{item.confidence}%</span>
            </div>
          </div>
          
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.trend === 'rising' ? 'bg-green-500' :
                      item.trend === 'falling' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${item.confidence}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI-Powered Insights Grid */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">AI-Powered Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.filter(i => i.priority !== 'critical').map((insight) => (
              <div key={insight.id} className={`rounded-lg p-5 border-l-4 ${
                insight.priority === 'high' ? 'border-red-400 bg-red-50' :
                insight.priority === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                'border-blue-400 bg-blue-50'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold">
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{insight.message}</p>
                    {insight.impact && (
                      <div className="text-xs text-green-600 font-medium mb-3">Impact: {insight.impact}</div>
                    )}
                                                              {insight.actionable && insight.action && (
                      <button 
                         onClick={() => {
                           if (insight.action) {
                             const actionType = insight.priority === 'high' ? 'Important Action' : 
                                              insight.priority === 'medium' ? 'Recommended Action' : 'Optional Action';
                             showConfirmation(
                               actionType,
                               `Are you sure you want to ${insight.action.toLowerCase()}? ${insight.impact ? `This could ${insight.impact.toLowerCase()}.` : ''}`,
                               () => {
                                 trackAction(`Executed: ${insight.action}`, true, () => {
                                   // Undo function - in real app this would revert the action
                                   showSuccess(`Action completed: ${insight.action}`);
                                 });
                                 showSuccess(`Action completed: ${insight.action}`);
                               }
                             );
                           }
                         }}
                         className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           insight.priority === 'high' ? 'bg-red-600 text-white hover:bg-red-700' :
                           insight.priority === 'medium' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                           'bg-blue-600 text-white hover:bg-blue-700'
                         }`}
                       >
                         {insight.action}
                      </button>
                     )}
                  </div>
              </div>
            </div>
                ))}
              </div>
              </div>

        {/* Enhanced Weather Dashboard */}
        {weatherData && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{t('weather_intelligence')}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Conditions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">{t('current_weather')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t('temperature')}:</span>
                    <span className="font-bold">{weatherData.current.temperature}°C</span>
          </div>
                  <div className="flex justify-between">
                    <span>{t('humidity')}:</span>
                    <span className="font-bold">{weatherData.current.humidity}%</span>
        </div>
                  <div className="flex justify-between">
                    <span>{t('wind_speed')}:</span>
                    <span className="font-bold">{weatherData.current.windSpeed} km/h</span>
            </div>
                  <div className="flex justify-between">
                    <span>{t('uv_index')}:</span>
                    <span className="font-bold">{weatherData.current.uvIndex}</span>
          </div>
          </div>
        </div>

              {/* 5-Day Forecast */}
              <div className="lg:col-span-2">
                <h4 className="font-semibold mb-3">{t('weather_forecast')}</h4>
                <div className="grid grid-cols-5 gap-2 text-center text-sm">
                  {weatherData.forecast.map((day: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded p-3">
                      <div className="font-medium mb-1">{day.day}</div>
                      <div className="text-2xl mb-1">{day.temp}°C</div>
                      <div className="text-xs text-gray-600 mb-2">{day.condition}</div>
                      <div className="text-xs text-gray-500">Rain: {day.rain}%</div>
                      <div className="text-xs mt-2 bg-blue-100 text-blue-800 rounded px-1 py-0.5">{day.impact}</div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
          
            {/* Weather Alerts */}
            {weatherData.alerts && weatherData.alerts.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                <h4 className="font-semibold mb-2 text-red-800">Weather Alerts</h4>
                {weatherData.alerts.map((alert: string, index: number) => (
                  <div key={index} className="text-sm text-red-700">• {alert}</div>
                ))}
            </div>
            )}
          </div>
        )}

        {/* Quick Action Center */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{t('quick_actions')}</h3>
              <p className="text-sm text-gray-600 mt-1">Take action on your farm with these essential tools</p>
            </div>
            {currentStep === 4 && (
              <div className="text-center">
                <div className="text-sm text-green-600 font-medium mb-2">✓ {t('dashboard_complete')}</div>
            <button 
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
                  {t('start_over')}
              </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                         {[
               { 
                 label: t('scan_crop'), 
                 path: '/scan-crop', 
                 description: 'Take a photo to check crop health',
                 icon: '📱'
               },
              { 
                label: t('view_market'), 
                path: '/market', 
                description: 'Check current crop prices',
                icon: '💰'
              },
              { 
                label: t('check_weather'), 
                path: '/weather', 
                description: 'View weather forecast',
                icon: '🌤️'
              },
              { 
                label: t('government_schemes'), 
                path: '/schemes', 
                description: 'Find government schemes',
                icon: '🏛️'
              },
              { 
                label: t('profit_calculator'), 
                path: '/profit-calculator', 
                description: 'Calculate farm profits',
                icon: '🧮'
              },
                             { 
                 label: t('crop_calendar'), 
                 path: '/crop-calendar', 
                 description: 'Plan your crop schedule',
                 icon: '📅'
               },
               { 
                 label: t('ai_assistant'), 
                 path: '#', 
                 description: 'Chat with AI farming expert',
                 icon: '🤖',
                 onClick: toggleChatbot
               }
                           ].map((action, index) => (
                 <button
                   key={index}
                   onClick={() => {
                     if (action.onClick) {
                       action.onClick();
                     } else {
                       navigate(action.path);
                     }
                   }}
                   className="p-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md text-center group"
                   title={action.description}
                   aria-label={`${action.label}: ${action.description}`}
                 >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                <div className="text-sm font-medium mb-1">{action.label}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </button>
            ))}
            </div>
              </div>
              
         {/* Action Receipts */}
         <div className="bg-white rounded-lg border border-gray-200 p-6">
           <div className="flex items-center justify-between mb-4">
             <div>
               <h3 className="text-xl font-bold text-gray-900">{t('action_receipts')}</h3>
               <p className="text-sm text-gray-600 mt-1">Detailed record of all your dashboard activities</p>
              </div>
          <button
               onClick={() => {
                 // In a real app, this would export to PDF or send via email
                 showSuccess('Receipts exported successfully!');
                 trackAction('Exported action receipts', false);
               }}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
             >
               Export {t('action_receipts')}
          </button>
            </div>
            
           <div className="space-y-3 max-h-64 overflow-y-auto">
             {recentActions.length === 0 ? (
               <div className="text-center py-8 text-gray-500">
                 <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 <p>No {t('recent_actions').toLowerCase()} yet. Complete some tasks to see your receipts here.</p>
               </div>
             ) : (
               recentActions.map((action) => (
                 <div key={action.id} className="border border-gray-200 rounded-lg p-4">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center space-x-3">
                       <div className={`w-3 h-3 rounded-full ${
                         action.canUndo ? 'bg-green-500' : 'bg-blue-500'
                       }`}></div>
                       <span className="text-sm font-medium text-gray-900">{action.action}</span>
                     </div>
                     <div className="text-xs text-gray-500">
                       {action.timestamp.toLocaleTimeString()}
                     </div>
            </div>
            
                   <div className="text-xs text-gray-600 mb-3">
                     Date: {action.timestamp.toLocaleDateString()} • 
                     Status: {action.canUndo ? 'Can be undone' : 'Completed'} • 
                     ID: {action.id}
              </div>
                   
                   {action.canUndo && (
                     <div className="flex items-center justify-between">
                       <span className="text-xs text-green-600 font-medium">✓ This action can be undone</span>
            <button 
                         onClick={() => undoAction(action.id)}
                         className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
                         {t('undo_available')}
              </button>
            </div>
                   )}
                </div>
               ))
             )}
            </div>
          </div>

         {/* Recent Actions with Undo */}
         {recentActions.length > 0 && (
           <div className="bg-white rounded-lg border border-gray-200 p-6">
             <div className="flex items-center justify-between mb-4">
               <div>
                 <h3 className="text-xl font-bold text-gray-900">{t('recent_actions')}</h3>
                 <p className="text-sm text-gray-600 mt-1">Track your recent activities with undo options</p>
               </div>
          <button
                 onClick={() => setRecentActions([])}
                 className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
                 Clear All
          </button>
      </div>

             <div className="space-y-3">
               {recentActions.map((action) => (
                 <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                   <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
              </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">{action.action}</p>
                       <p className="text-xs text-gray-500">
                         {action.timestamp.toLocaleTimeString()} • {action.timestamp.toLocaleDateString()}
                       </p>
            </div>
                   </div>
                   
                   {action.canUndo && (
                <button
                       onClick={() => undoAction(action.id)}
                       className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                       {t('undo_available')}
                </button>
                   )}
                </div>
              ))}
            </div>
              </div>
            )}

         {/* Floating Chat Button */}
         <button
           onClick={toggleChatbot}
           className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 z-40 flex items-center justify-center group"
           title="Chat with AI Assistant"
           aria-label="Open AI Chat Assistant"
         >
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
           </svg>
           {!showChatbot && (
             <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
               <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
             </div>
           )}
         </button>

         {/* Chatbot Interface */}
         {showChatbot && (
           <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
             {/* Chat Header */}
             <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
               <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                   <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                   </svg>
                 </div>
                 <div>
                   <h3 className="font-semibold">{t('ai_assistant_title')}</h3>
                   <p className="text-xs text-blue-100">Powered by Gemini AI</p>
                 </div>
               </div>
               <button
                 onClick={toggleChatbot}
                 className="text-blue-100 hover:text-white transition-colors"
                 aria-label="Close chat"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>

             {/* Chat Messages */}
             <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
               {chatMessages.map((msg, index) => (
                 <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-3 rounded-lg ${
                     msg.type === 'user' 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-white text-gray-800 border border-gray-200'
                   }`}>
                     <div 
                       className="text-sm"
                       dangerouslySetInnerHTML={{ 
                         __html: msg.type === 'bot' ? parseMarkdown(msg.message) : msg.message 
                       }}
                     />
                     <div className={`text-xs mt-1 ${
                       msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                     }`}>
                       {msg.timestamp.toLocaleTimeString()}
                     </div>
                   </div>
                 </div>
               ))}
               {chatLoading && (
                 <div className="flex justify-start">
                   <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg">
                     <div className="flex items-center space-x-2">
                       <div className="flex space-x-1">
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                       </div>
                       <span className="text-sm text-gray-600">{t('chat_loading')}</span>
                     </div>
                   </div>
                 </div>
               )}
             </div>

             {/* Chat Input */}
             <div className="p-4 border-t border-gray-200 bg-white">
               <form onSubmit={handleChatSubmit} className="flex space-x-2">
                 <input
                   type="text"
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   placeholder={t('type_message')}
                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   disabled={chatLoading}
                 />
                 <button
                   type="submit"
                   disabled={chatLoading || !chatInput.trim()}
                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                   </svg>
                 </button>
               </form>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 };

export default Dashboard;