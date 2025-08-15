const { geminiModel } = require('../config/googleCloud');

class CropHealthService {
	async analyzeCropImage(imageBuffer, cropType = 'general', mimeType = 'image/jpeg') {
		try {
			const base64Image = imageBuffer.toString('base64');

			const contents = [
				{
					role: 'user',
					parts: [
						{
							text: `Analyze this crop image and provide:
1. Disease/pest identification (if any)
2. Severity (Low/Medium/High)
3. Symptoms description
4. Recommended treatments (affordable, available in India)
5. Prevention measures
6. Expected recovery time

Crop type: ${cropType}
Respond in simple, actionable language suitable for farmers.`,
						},
						{
							inlineData: {
								mimeType,
								data: base64Image,
							},
						},
					],
				},
			];

			const result = await geminiModel.generateContent({ contents });
			const analysis = this.extractText(result);

			return this.parseAnalysisResponse(analysis);
		} catch (error) {
			console.error('Error analyzing crop image:', error);
			throw new Error('Failed to analyze crop image');
		}
	}

	extractText(result) {
		try {
			const candidates = result.response?.candidates || [];
			const parts = candidates[0]?.content?.parts || [];
			return parts.map((p) => p.text || '').join('').trim();
		} catch {
			return '';
		}
	}

	parseAnalysisResponse(analysis) {
		return {
			analysis,
			timestamp: new Date().toISOString(),
			confidence: 'high',
			recommendations: this.extractRecommendations(analysis),
		};
	}

	extractRecommendations(analysis) {
		const recommendations = [];
		if (analysis.match(/\b(treatment|apply|spray)\b/i)) recommendations.push('Apply recommended treatment');
		if (analysis.match(/\b(remove|destroy|prune)\b/i)) recommendations.push('Remove infected parts');
		if (analysis.match(/\b(water|irrigation|moisture)\b/i)) recommendations.push('Adjust irrigation practices');
		return recommendations;
	}
}

module.exports = new CropHealthService();