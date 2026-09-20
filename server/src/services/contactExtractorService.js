import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { ENV } from '../config/env.js';

/**
 * Parses structured CSV, TSV, or comma/tab delimited text to contacts
 */
export const parseCsvOrDelimited = (text) => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const sampleLine = lines[0];
  let delimiter = ',';
  if (sampleLine.includes('\t')) delimiter = '\t';
  else if (sampleLine.includes(';') && !sampleLine.includes(',')) delimiter = ';';
  else if (sampleLine.includes('|')) delimiter = '|';

  const splitLine = (line) => {
    // Regex taking quoted columns into account
    const pattern = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
    const fields = [];
    let match;
    while ((match = pattern.exec(line))) {
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      fields.push((val || '').trim());
    }
    return fields;
  };

  const headers = splitLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const isFirstLineData = headers.some(h => h.includes('@'));
  const startIndex = isFirstLineData ? 0 : 1;

  let emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
  let companyIdx = headers.findIndex(h => h.includes('company') || h.includes('org') || h.includes('firm'));
  let nameIdx = headers.findIndex(h => h.includes('recruiter') || h.includes('contact') || h.includes('name') || h.includes('hr'));
  let posIdx = headers.findIndex(h => h.includes('position') || h.includes('role') || h.includes('title') || h.includes('job') || h.includes('purpose') || h.includes('status'));

  const contacts = [];

  for (let i = startIndex; i < lines.length; i++) {
    const parts = splitLine(lines[i]);
    if (parts.length < 2) continue;

    let email = '';
    let companyName = '';
    let contactName = 'Hiring Manager';
    let position = 'Software Engineer';
    let notes = '';

    if (emailIdx !== -1 && parts[emailIdx]) {
      email = parts[emailIdx];
      companyName = companyIdx !== -1 ? parts[companyIdx] : '';
      contactName = nameIdx !== -1 ? parts[nameIdx] : 'Hiring Manager';
      position = posIdx !== -1 ? parts[posIdx] : 'Software Engineer';
    } else {
      const foundEmailIdx = parts.findIndex(p => p.includes('@'));
      if (foundEmailIdx !== -1) {
        email = parts[foundEmailIdx];
        if (foundEmailIdx === 1 && parts[0]) companyName = parts[0];
        else if (foundEmailIdx > 1) {
          companyName = parts[0];
          contactName = parts[1];
        }
        if (parts[foundEmailIdx + 1]) position = parts[foundEmailIdx + 1];
        if (parts[foundEmailIdx + 2]) notes = parts[foundEmailIdx + 2];
      }
    }

    if (email && email.includes('@')) {
      contacts.push({
        companyName: companyName || 'Hiring Company',
        email: email.toLowerCase().trim(),
        contactName: contactName || 'Hiring Manager',
        position: position || 'Software Engineer',
        notes: notes || '',
        tags: ['CSV Import'],
      });
    }
  }

  return contacts;
};

/**
 * Extracts contacts from PDF using Gemini Multimodal
 */
export const aiExtractFromPdfGemini = async (buffer, apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a recruitment lead extraction assistant.
Analyze this document/table and extract all company hiring contacts, company names, and recruiter/careers email addresses.
For each row/entry found, extract:
- companyName: string (Exact name of the company or organization)
- email: string (Valid email address, lowercase)
- contactName: string (Name of recruiter/HR if mentioned, otherwise "Hiring Manager")
- position: string (Job position or purpose, e.g. "Full Stack Developer", "Hiring", "Internship")
- notes: string (Any purpose, status, or details in the table)

CRITICAL RULES:
1. Extract ALL valid entries from every page/table.
2. Every item MUST have a valid email address.
3. Return STRICT JSON ARRAY only:
[
  {
    "companyName": "MediNex Workforce",
    "email": "support@medinexworkforce.com",
    "contactName": "Hiring Manager",
    "position": "Software Engineer",
    "notes": "Hiring/careers"
  }
]
No markdown backticks, no explanatory comments.`;

  const part = {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: 'application/pdf',
    },
  };

  const result = await model.generateContent([prompt, part]);
  const text = result.response.text();
  const cleanJson = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(cleanJson);
  return Array.isArray(parsed) ? parsed : (parsed.contacts || parsed.data || []);
};

/**
 * Extracts contacts from raw text or CSV using AI
 */
export const aiExtractFromText = async (text, { geminiApiKey, openaiApiKey }) => {
  const prompt = `You are a data extraction assistant.
Extract all hiring companies, recruiter emails, and job details from this text:
For each entry found, return:
- companyName: string
- email: string (valid email)
- contactName: string (recruiter name or "Hiring Manager")
- position: string (target role or "Software Engineer")
- notes: string (purpose or status)

Return STRICT JSON ARRAY only:
[
  { "companyName": "...", "email": "...", "contactName": "...", "position": "...", "notes": "..." }
]
No other text.
Content:
${text.slice(0, 40000)}`;

  if (geminiApiKey) {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);
    return Array.isArray(parsed) ? parsed : (parsed.contacts || parsed.data || []);
  }

  if (openaiApiKey) {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });
    const parsed = JSON.parse(completion.choices[0].message.content);
    return Array.isArray(parsed) ? parsed : (parsed.contacts || parsed.data || []);
  }

  return [];
};
