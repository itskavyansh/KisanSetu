const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config();

const vertexAI = new VertexAI({
	project: process.env.GOOGLE_CLOUD_PROJECT_ID,
	location: process.env.VERTEX_AI_LOCATION || 'us-central1',
});

const geminiModel = vertexAI.getGenerativeModel({
	model: process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash',
});

module.exports = {
	vertexAI,
	geminiModel,
};