// AI Agent Service with lightweight intent handling for market price queries

const reliablePriceService = require('./reliablePriceService');

class AIAgentService {
	constructor() {
		this.userIdToHistory = new Map();
	}

	async processQuery(query, language = 'en', userId = 'default') {
		const timestamp = new Date().toISOString();
		let reply;

		try {
			if (this.isPriceIntent(query)) {
				reply = await this.answerMarketPrice(query);
			} else {
				reply = this.generateSmallTalkReply(query, language);
			}
		} catch (error) {
			reply = 'Sorry, I could not fetch the information right now.';
		}

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

	isPriceIntent(text) {
		const t = (text || '').toLowerCase();
		return /(price|rate|cost|market\s*price|mandi)/i.test(t);
	}

	async answerMarketPrice(text) {
		const commodity = await this.extractCommodity(text);
		const { state, market } = await this.extractLocation(text);
		const quantityKg = this.extractQuantityKg(text);

		const records = await reliablePriceService.getMarketPrices(commodity, state, market);
		const today = records && records.length > 0 ? records[0] : null;
		if (!today) {
			return `Sorry, I couldn't find prices for ${commodity} in ${market}, ${state}.`;
		}

		const perKg = parseFloat(today['Model Prize']);
		const min = parseFloat(today['Min Prize']);
		const max = parseFloat(today['Max Prize']);
		const total = Math.round(perKg * quantityKg);
		const date = today['Date'];

		return `Estimated price for ${quantityKg} kg of ${commodity} in ${market}, ${state} on ${date}: ₹${total} (₹${perKg}/kg). Range: ₹${min}–₹${max}/kg.`;
	}

	// Public helper for routes to directly get market price text
	async getMarketPriceFromQuery(text) {
		return this.answerMarketPrice(text);
	}

	async extractCommodity(text) {
		const commodities = await reliablePriceService.getAvailableCommodities();
		const normalized = text.toLowerCase();
		const synonyms = {
			'potato': 'Potato', 'potatoes': 'Potato', 'aloo': 'Potato',
			'tomato': 'Tomato', 'tomatoes': 'Tomato',
			'onion': 'Onion', 'onions': 'Onion',
			'rice': 'Rice', 'wheat': 'Wheat'
		};
		for (const [key, value] of Object.entries(synonyms)) {
			if (normalized.includes(key)) return value;
		}
		for (const c of commodities) {
			if (normalized.includes(c.toLowerCase())) return c;
		}
		// Default commodity
		return 'Potato';
	}

	async extractLocation(text) {
		const t = text.toLowerCase();
		const cityToState = {
			'delhi': { state: 'Delhi', market: 'Delhi' },
			'mumbai': { state: 'Maharashtra', market: 'Mumbai' },
			'pune': { state: 'Maharashtra', market: 'Pune' },
			'bangalore': { state: 'Karnataka', market: 'Bangalore' },
			'bengaluru': { state: 'Karnataka', market: 'Bangalore' },
			'chennai': { state: 'Tamil Nadu', market: 'Chennai' },
			'hyderabad': { state: 'Andhra Pradesh', market: 'Hyderabad' }
		};
		for (const city of Object.keys(cityToState)) {
			if (t.includes(city)) return cityToState[city];
		}
		return { state: 'Karnataka', market: 'Bangalore' };
	}

	extractQuantityKg(text) {
		const match = (text || '').toLowerCase().match(/(\d+)\s*(kg|kilogram|kilograms)/);
		if (match) {
			return parseInt(match[1], 10);
		}
		return 1;
	}

	generateSmallTalkReply(query, language) {
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



