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
  const openaiApiKey = apiKey || user?.emailConfig?.openaiApiKey || ENV.OPENAI_API_KEY;
  const geminiApiKey = apiKey || user?.emailConfig?.geminiApiKey || ENV.GEMINI_API_KEY;

  // Extract skills & experience from resume/user
  let candidateSkills = user?.skills?.join(', ') || '';
  let candidateSummary = '';
  let candidateExperience = '';
  let candidateName = user?.name || 'Applicant';
  let candidatePortfolio = user?.links?.portfolio || '';
  let candidateGithub = user?.links?.github || '';
  let candidateLinkedin = user?.links?.linkedin || '';

  if (resume?.builderData) {
    const b = resume.builderData;
    if (b.personalInfo?.fullName) candidateName = b.personalInfo.fullName;
    if (b.skills?.length) candidateSkills = b.skills.join(', ');
    if (b.summary) candidateSummary = b.summary;
    if (b.experience?.length) {
      candidateExperience = b.experience
        .map(e => `${e.role} at ${e.company}: ${e.description || (e.bullets || []).join('; ')}`)
        .join('\n');
    }
  }

  const prompt = `You are an expert career strategist and cold email copywriter.
Generate a compelling, personalized, high-converting job application email from the candidate to an HR/Hiring Manager.

CANDIDATE INFO:
- Name: ${candidateName}
- Target Role: ${position}
- Core Skills: ${candidateSkills || 'Full Stack Development, Problem Solving'}
- Summary: ${candidateSummary || 'Experienced software professional passionate about building reliable web systems.'}
- Experience Highlights: ${candidateExperience || 'Built robust web applications and scalable APIs.'}
- Portfolio: ${candidatePortfolio}
- LinkedIn: ${candidateLinkedin}
- GitHub: ${candidateGithub}

RECIPIENT & JOB INFO:
- Company Name: ${companyName}
- Recipient/HR Name: ${recipientName}
- Target Job Position: ${position}
- Job Description / Requirements: ${jobDescription || 'Not provided'}
- Tone: ${tone} (e.g. professional, confident, enthusiastic, concise)
- Additional Instructions: ${customInstructions || 'None'}

CRITICAL RULES:
1. Do NOT hallucinate false companies, degrees, or certifications not in the candidate info.
2. Ground all claims in the provided candidate data.
3. Keep the email concise (120-200 words max), punchy, and focused on value proposition for ${companyName}.
4. Mention that the resume is attached for review.
5. Provide a clear call to action (e.g. requesting a brief 10-15 min conversation).
6. Return STRICT JSON output only with keys "subject" and "body". No markdown backticks or commentary.

Output format:
{
  "subject": "Application for [Position] - [Candidate Name]",
  "body": "Dear [RecipientName],\\n\\n[Email Body]\\n\\nBest regards,\\n[Candidate Name]"
}`;

  // Validation: Mandatory User AI API Key
  if (!openaiApiKey && !geminiApiKey) {
    const error = new Error('AI API Key is required. Please configure your personal Gemini or OpenAI API Key in Profile Settings to generate AI cold emails.');
    error.statusCode = 400;
    throw error;
  }

  let lastError = null;

  // 1. Try OpenAI if API Key is configured
  if (openaiApiKey && (ENV.AI_PROVIDER === 'openai' || !geminiApiKey)) {
    try {
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
    } catch (err) {
      console.warn('[OpenAI] Call failed:', err.message);
      lastError = err;
    }
  }

  // 2. Try Gemini if configured
  if (geminiApiKey) {
    try {
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
    } catch (err) {
      console.warn('[Gemini AI] Call failed:', err.message);
      lastError = err;
    }
  }

  // 3. If API keys were provided but all attempts failed, report the error to the user
  if (lastError) {
    const error = new Error(`AI generation failed with your API key: ${lastError.message || 'Invalid API Key or Quota Exceeded'}. Please check your key in Settings.`);
    error.statusCode = 400;
    throw error;
  }

  const error = new Error('Failed to generate AI email. Please verify your API key in Settings.');
  error.statusCode = 400;
  throw error;
};

