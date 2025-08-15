const { geminiModel } = require('../config/googleCloud');

class CropHealthService {
  constructor() {
    this.model = geminiModel;
  }

  async analyzeCropImage(imageBuffer, cropType = 'general') {
    try {
      // Convert image to base64 for Gemini
      const base64Image = imageBuffer.toString('base64');
      
      // Create prompt for crop analysis
      const prompt = `
        Analyze this crop image and provide:
        1. Disease/pest identification (if any)
        2. Severity level (Low/Medium/High)
        3. Symptoms description
        4. Recommended treatments (locally available in India)
        5. Prevention measures
        6. Expected recovery time
        
        Crop type: ${cropType}
        Respond in simple, actionable language suitable for farmers.
      `;

      // Generate content with image
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
          }
        }
      ]);

      const response = await result.response;
      const analysis = response.text();

      // Parse and structure the response
      return this.parseAnalysisResponse(analysis);
    } catch (error) {
      console.error('Error analyzing crop image:', error);
      throw new Error('Failed to analyze crop image');
    }
  }

  parseAnalysisResponse(analysis) {
    // Basic parsing - you can enhance this based on Gemini's response format
    return {
      analysis: analysis,
      timestamp: new Date().toISOString(),
      confidence: 'high', // You can extract this from Gemini's response
      recommendations: this.extractRecommendations(analysis)
    };
  }

  extractRecommendations(analysis) {
    // Extract key recommendations from the analysis
    const recommendations = [];
    
    // Look for treatment recommendations
    if (analysis.includes('treatment') || analysis.includes('apply')) {
      recommendations.push('Apply recommended treatment');
    }
    
    if (analysis.includes('remove') || analysis.includes('destroy')) {
      recommendations.push('Remove infected parts');
    }
    
    if (analysis.includes('water') || analysis.includes('irrigation')) {
      recommendations.push('Adjust irrigation practices');
    }
    
    return recommendations;
  }
}

module.exports = new CropHealthService();