import React, { useState } from 'react';

const ChatExample = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setResponse(data.response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gemini AI Chat Example</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Ask Gemini anything:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Enter your question here..."
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Send to Gemini'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="font-semibold mb-2">Gemini Response:</h3>
          <div className="whitespace-pre-wrap">{response}</div>
        </div>
      )}
    </div>
  );
};

export default ChatExample;
