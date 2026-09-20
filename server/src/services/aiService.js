import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';

export const generateJobEmail = async ({
  user,
  resume,
  companyName,
  position,
  recipientName = 'Hiring Team',
  jobDescription = '',
  tone = 'professional',
  customInstructions = '',
  apiKey = '',
}) => {
  let openaiApiKey = user?.emailConfig?.openaiApiKey || ENV.OPENAI_API_KEY;
  let geminiApiKey = user?.emailConfig?.geminiApiKey || ENV.GEMINI_API_KEY;

  if (apiKey) {
    if (apiKey.startsWith('sk-')) {
      openaiApiKey = apiKey;
    } else if (apiKey.startsWith('AIza')) {
      geminiApiKey = apiKey;
    } else {
      openaiApiKey = apiKey;
    }
  }

  const preferredProvider = user?.emailConfig?.aiProvider || (openaiApiKey ? 'openai' : 'gemini');

  // Validation: Mandatory User AI API Key
  if (!openaiApiKey && !geminiApiKey) {
    const error = new Error('AI API Key is required. Please configure your personal Gemini or OpenAI API Key in Profile Settings to generate AI cold emails.');
    error.statusCode = 400;
    throw error;
  }

  let lastError = null;

  const runOpenAI = async () => {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert cold outreach AI assistant that outputs strictly valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseContent);

    return {
      subject: parsed.subject || `Application for ${position} - ${candidateName}`,
      body: parsed.body,
      generatedBy: 'openai-gpt4o',
      warnings: [],
    };
  };

  const runGemini = async () => {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    const cleanJson = textResponse.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      subject: parsed.subject || `Application for ${position} - ${candidateName}`,
      body: parsed.body,
      generatedBy: 'gemini',
      warnings: [],
    };
  };

  // Execution order:
  // If user prefers OpenAI or has only OpenAI key -> Try OpenAI first
  if ((preferredProvider === 'openai' || !geminiApiKey) && openaiApiKey) {
    try {
      return await runOpenAI();
    } catch (err) {
      console.warn('[OpenAI] Primary call failed, checking Gemini fallback:', err.message);
      lastError = err;
      if (geminiApiKey) {
        try {
          return await runGemini();
        } catch (geminiErr) {
          console.warn('[Gemini fallback failed]:', geminiErr.message);
          lastError = geminiErr;
        }
      }
    }
  } else if (geminiApiKey) {
    try {
      return await runGemini();
    } catch (err) {
      console.warn('[Gemini AI] Primary call failed, checking OpenAI fallback:', err.message);
      lastError = err;
      if (openaiApiKey) {
        try {
          return await runOpenAI();
        } catch (openAiErr) {
          console.warn('[OpenAI fallback failed]:', openAiErr.message);
          lastError = openAiErr;
        }
      }
    }
  } else if (openaiApiKey) {
    try {
      return await runOpenAI();
    } catch (err) {
      lastError = err;
    }
  }

  // If all attempts failed, report the error to the user
  if (lastError) {
    const error = new Error(`AI generation failed: ${lastError.message || 'Invalid API Key or Quota Exceeded'}. Please verify your API key in Settings.`);
    error.statusCode = 400;
    throw error;
  }

  const error = new Error('Failed to generate AI email. Please verify your API key in Settings.');
  error.statusCode = 400;
  throw error;
};

