// Temporary simplified version to get the server running
require('dotenv').config();

// Mock objects for now - we'll replace these with real ones later
const mockVertexAI = {
  getGenerativeModel: (config) => ({
    generateContent: async () => ({
      response: {
        text: () => "Mock AI response - Google Cloud not configured yet"
      }
    })
  })
};

const mockStorage = {
  bucket: () => ({})
};

const mockGeminiModel = mockVertexAI.getGenerativeModel({});

module.exports = {
  vertexAI: mockVertexAI,
  storage: mockStorage,
  geminiModel: mockGeminiModel,
};