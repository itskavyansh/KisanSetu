// AI Agent Service with lightweight intent handling for market price queries
// Extended with external tools: Weather (Open-Meteo) and Wikipedia summaries.

const reliablePriceService = require('./reliablePriceService');
const axios = require('axios');

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
			} else if (this.isWeatherIntent(query)) {
				reply = await this.answerWeather(query);
			} else if (this.isWikiIntent(query)) {
				reply = await this.answerWikipedia(query);
			} else if (this.isNewsIntent(query)) {
				reply = await this.answerNews(query);
			} else if (this.isWebIntent(query)) {
				reply = await this.answerViaWeb(query);
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

	isWeatherIntent(text) {
		const t = (text || '').toLowerCase();
		return /(weather|temperature|rain|forecast)/i.test(t);
	}

	isWikiIntent(text) {
		const t = (text || '').toLowerCase();
		return /^(who|what|where|when|why|how)\b/.test(t) || /wikipedia|explain|tell me about/.test(t);
	}

	isNewsIntent(text) {
		const t = (text || '').toLowerCase();
		return /(news|headlines|breaking|latest|today)/i.test(t);
	}

	isWebIntent(text) {
		const t = (text || '').toLowerCase();
		return /(online|internet|web|browse|check\s+online|search\s+online)/i.test(t);
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
		// Avoid template-y replies: try to be minimally informative if no tool intent matched
		return `I can help with market prices, weather, or topic lookups. Try: "tomato price in Pune", "weather in Mumbai tomorrow", or "What is drip irrigation?"`;
	}

	// ===== External Tools =====

	async answerWeather(text) {
		const { name } = await this.extractCityOrLocation(text);
		if (!name) {
			return 'Please specify a city or location for the weather (e.g., Bangalore, Delhi).';
		}
		try {
			const geo = await this.geocodeCity(name);
			if (!geo) {
				return `I could not find the location "${name}".`;
			}
			const forecast = await this.fetchWeather(geo.latitude, geo.longitude);
			if (!forecast) {
				return `Weather data is unavailable for ${geo.name}.`;
			}
			const current = forecast.current;
			const d0 = forecast.daily?.[0];
			const parts = [];
			if (current) parts.push(`Now in ${geo.name}: ${current.temperature_2m}°C, precipitation ${current.precipitation}mm.`);
			if (d0) parts.push(`Today: max ${d0.temperature_2m_max}°C, min ${d0.temperature_2m_min}°C, rain ${d0.precipitation_sum}mm.`);
			return parts.join(' ');
		} catch (e) {
			return 'Sorry, I could not fetch weather right now.';
		}
	}

	async extractCityOrLocation(text) {
		const t = (text || '').toLowerCase();
		// Try common Indian cities quickly
		const cities = ['delhi', 'mumbai', 'pune', 'bangalore', 'bengaluru', 'chennai', 'hyderabad', 'kolkata', 'ahmedabad', 'jaipur'];
		for (const c of cities) {
			if (t.includes(c)) return { name: c };
		}
		// Fallback: try to pick last word as potential city (very naive)
		const tokens = t.split(/[^a-z]+/).filter(Boolean);
		const guess = tokens[tokens.length - 1];
		if (guess && guess.length >= 3) return { name: guess };
		return { name: null };
	}

	async geocodeCity(name) {
		const url = 'https://geocoding-api.open-meteo.com/v1/search';
		const { data } = await axios.get(url, { params: { name, count: 1, language: 'en', format: 'json' } });
		const r = data && Array.isArray(data.results) ? data.results[0] : null;
		if (!r) return null;
		return { name: r.name, latitude: r.latitude, longitude: r.longitude };
	}

	async fetchWeather(latitude, longitude) {
		const url = 'https://api.open-meteo.com/v1/forecast';
		const { data } = await axios.get(url, {
			params: {
				latitude,
				longitude,
				current: 'temperature_2m,precipitation',
				daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
				timezone: 'auto'
			}
		});
		const current = data?.current;
		const daily = data?.daily && data.daily.time ? data.daily.time.map((_, i) => ({
			time: data.daily.time[i],
			temperature_2m_max: data.daily.temperature_2m_max[i],
			temperature_2m_min: data.daily.temperature_2m_min[i],
			precipitation_sum: data.daily.precipitation_sum[i]
		})) : [];
		return { current, daily };
	}

	async answerWikipedia(text) {
		const topic = await this.extractWikiTopic(text);
		if (!topic) return 'Please specify a topic to look up.';
		try {
			const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
			const { data } = await axios.get(url, { headers: { 'Accept': 'application/json' } });
			if (data?.extract) {
				return `${data.title}: ${data.extract}`;
			}
			return `I could not find a summary for "${topic}".`;
		} catch (e) {
			return 'Sorry, I could not fetch external information right now.';
		}
	}

	async extractWikiTopic(text) {
		// Remove common question prefixes
		let t = (text || '').trim();
		t = t.replace(/^\s*(who|what|where|when|why|how)\s+(is|are|was|were|the)\s*/i, '');
		t = t.replace(/\?+\s*$/, '');
		return t.length ? t : null;
	}

	// ===== Generic Web Answer (search + scrape) =====
	async answerViaWeb(text) {
		const query = this.ensureIndiaContext((text || '').trim());
		try {
			const links = await this.webSearchBing(query);
			if (!links.length) return 'No relevant web results found.';
			const prioritized = this.prioritizeIndianDomains(links);
			const top = prioritized.slice(0, 3);
			const pages = [];
			for (const l of top) {
				const content = await this.fetchAndExtract(l.url);
				pages.push({ title: l.title, url: l.url, content });
			}
			// Build a concise answer by stitching highlights
			const bullets = pages.map(p => `- **${p.title}**: ${this.firstLines(p.content, 2)} (${p.url})`);
			return `Here is what I found online:\n${bullets.join('\n')}`;
		} catch (e) {
			return 'Sorry, I could not fetch web results right now.';
		}
	}

	async webSearchBing(query) {
		const url = 'https://www.bing.com/search';
		const { data: html } = await axios.get(url, {
			params: { q: query, mkt: 'en-IN', cc: 'IN' },
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
				'Accept-Language': 'en-IN,en;q=0.9'
			}
		});
		const cheerio = require('cheerio');
		const $ = cheerio.load(html);
		const results = [];
		$('li.b_algo h2 a').each((_, el) => {
			const title = $(el).text().trim();
			const href = $(el).attr('href');
			if (title && href && results.length < 8) results.push({ title, url: href });
		});
		return results;
	}

	async fetchAndExtract(url) {
		const { data: html } = await axios.get(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
			}
		});
		const cheerio = require('cheerio');
		const $ = cheerio.load(html);
		$('script, style, noscript').remove();
		const main = $('article, main, #content, .content, #main').first();
		const text = (main.length ? main.text() : $('body').text()).replace(/\s+/g, ' ').trim();
		return text.slice(0, 1200);
	}

	firstLines(text, approxSentences = 2) {
		const s = (text || '').split(/(?<=[.!?])\s+/).slice(0, approxSentences).join(' ');
		return s || (text || '').slice(0, 180);
	}

	async answerNews(text) {
		const query = this.ensureIndiaContext(this.extractNewsQuery(text));
		try {
			const url = 'https://news.google.com/search';
			const { data: html } = await axios.get(url, {
				params: {
					q: query,
					hl: 'en-IN',
					gl: 'IN',
					ceid: 'IN:en'
				},
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
				}
			});
			// Very lightweight parse to extract headlines and links
			const cheerio = require('cheerio');
			const $ = cheerio.load(html);
			const results = [];
			$('a.DY5T1d, h3 a').each((_, el) => {
				if (results.length >= 5) return;
				const title = $(el).text().trim();
				let href = $(el).attr('href') || '';
				if (href.startsWith('./')) href = 'https://news.google.com' + href.slice(1);
				if (title && href) results.push({ title, url: href });
			});
			if (!results.length) return 'No recent headlines found.';
			return 'Top headlines:\n' + results.map((r, i) => `${i + 1}. ${r.title} — ${r.url}`).join('\n');
		} catch (e) {
			return 'Sorry, I could not fetch news right now.';
		}
	}

	extractNewsQuery(text) {
		const t = (text || '').trim();
		const lowered = t.toLowerCase();
		if (lowered.includes('mandi')) return 'mandi prices India';
		if (lowered.includes('agri') || lowered.includes('agriculture')) return 'agriculture India';
		return t.length > 0 ? t : 'India news';
	}

	// Ensure prompts/queries are India-specific
	ensureIndiaContext(text) {
		const t = (text || '').trim();
		if (!t) return 'India';
		const hasIndia = /\b(india|indian|bharat|hindustan)\b/i.test(t);
		return hasIndia ? t : `${t} India`;
	}

	prioritizeIndianDomains(links) {
		const priorityDomains = [
			'.gov.in', '.nic.in', '.ac.in', '.org.in', '.in'
		];
		const score = (url) => {
			const lower = (url || '').toLowerCase();
			let s = 0;
			for (const d of priorityDomains) if (lower.includes(d)) s += 2;
			if (/\b(india|indian|bharat|hindustan)\b/i.test(lower)) s += 1;
			return s;
		};
		return [...links].sort((a, b) => score(b.url) - score(a.url));
	}
}

module.exports = new AIAgentService();



