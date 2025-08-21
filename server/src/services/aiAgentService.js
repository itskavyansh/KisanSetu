// Minimal mock AI Agent Service to unblock voice routes

class AIAgentService {
	constructor() {
		this.userIdToHistory = new Map();
	}

	async processQuery(query, language = 'en', userId = 'default') {
		const timestamp = new Date().toISOString();
		const reply = this.generateReply(query, language);
		const record = { query, reply, language, timestamp };
		this.appendHistory(userId, record);
		return {
			success: true,
			data: {
				reply,
				language,
				timestamp
			}
		};
	}

	async getConversationHistory(userId = 'default') {
		const history = this.userIdToHistory.get(userId) || [];
		return {
			success: true,
			data: { userId, history }
		};
	}

	appendHistory(userId, record) {
		if (!this.userIdToHistory.has(userId)) {
			this.userIdToHistory.set(userId, []);
		}
		this.userIdToHistory.get(userId).push(record);
	}

	generateReply(query, language) {
		const baseReply = `You said: "${query}".`;
		switch (language) {
			case 'kannada':
				return `${baseReply} (ಕನ್ನಡ ಪ್ರತಿಕ್ರಿಯೆ - ಡೆಮೊ)`;
			case 'hindi':
				return `${baseReply} (हिंदी प्रतिक्रिया - डेमो)`;
			case 'telugu':
				return `${baseReply} (తెలుగు ప్రతిస్పందన - డెమో)`;
			case 'tamil':
				return `${baseReply} (தமிழ் பதில் - டெமோ)`;
			default:
				return `${baseReply} (English reply - demo)`;
		}
	}
}

module.exports = new AIAgentService();


