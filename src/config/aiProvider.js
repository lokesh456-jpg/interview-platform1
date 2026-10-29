/**
 * AI Provider abstraction layer.
 * Supports 'openai' and 'gemini'. Add new providers here.
 */

let provider = null;
let providerName = null;

const initAIProvider = () => {
  const selected = process.env.AI_PROVIDER || 'gemini';

  if (selected === 'openai' && process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    provider = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    providerName = 'openai';
    console.log('✅ AI Provider: OpenAI');
  } else if (selected === 'gemini' && process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    provider = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    providerName = 'gemini';
    console.log('✅ AI Provider: Google Gemini');
  } else {
    console.warn(`⚠️  AI Provider "${selected}" not configured. AI features will be disabled.`);
    providerName = null;
    provider = null;
  }
};

const getProvider = () => provider;
const getProviderName = () => providerName;
const isAIConfigured = () => provider !== null;

/**
 * Core text generation function - provider agnostic
 * @param {string} prompt
 * @param {object} options
 * @returns {Promise<string>}
 */
const generateText = async (prompt, options = {}) => {
  if (!provider) {
    throw new Error('AI provider is not configured. Please set AI_PROVIDER and the corresponding API key in your .env file.');
  }

  const { temperature = 0.7, maxTokens = 4096 } = options;

  if (providerName === 'openai') {
    const response = await provider.chat.completions.create({
      model: options.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: options.systemPrompt || 'You are an expert AI interview coach.' },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    });
    return response.choices[0].message.content;
  }

  if (providerName === 'gemini') {
    const model = provider.getGenerativeModel({
      model: options.model || 'gemini-1.5-flash',
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: options.jsonMode ? 'application/json' : 'text/plain',
      },
    });
    const fullPrompt = options.systemPrompt
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  }

  throw new Error(`Unsupported AI provider: ${providerName}`);
};

module.exports = { initAIProvider, getProvider, getProviderName, isAIConfigured, generateText };
