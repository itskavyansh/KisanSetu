import apiClient from './apiService';

export interface VoiceChatRequest {
  query: string;
  language: string;
  userId?: string;
}

export interface VoiceChatResponse {
  success: boolean;
  data: {
    intent: string;
    response: string;
    language: string;
    confidence: number;
    suggestions: string[];
  };
}

export const voiceAPI = {
  // Chat with AI agent
  chat: async (data: VoiceChatRequest): Promise<VoiceChatResponse> => {
    const response = await apiClient.post('/voice/chat', data);
    return response.data;
  },

  // Get supported languages
  getSupportedLanguages: async () => {
    const response = await apiClient.get('/voice/supported-languages');
    return response.data;
  },

  // Get conversation history
  getConversationHistory: async (userId: string) => {
    const response = await apiClient.get(`/voice/conversation-history/${userId}`);
    return response.data;
  },
};
