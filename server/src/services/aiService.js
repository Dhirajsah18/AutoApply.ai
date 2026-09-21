import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';
import { decryptSecret } from './cryptoService.js';

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
  let openaiApiKey = decryptSecret(user?.emailConfig?.openaiApiKey) || ENV.OPENAI_API_KEY;
  let geminiApiKey = decryptSecret(user?.emailConfig?.geminiApiKey) || ENV.GEMINI_API_KEY;

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
    const geminiModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
    
    let textResponse = null;
    let modelError = null;

    for (const mName of geminiModels) {
      try {
        const model = genAI.getGenerativeModel({ model: mName });
        const result = await model.generateContent(prompt);
        textResponse = result.response.text();
        break;
      } catch (err) {
        modelError = err;
        if (err.message?.includes('404') || err.message?.includes('not found') || err.message?.includes('no longer available')) {
          continue;
        }
        throw err;
      }
    }

    if (!textResponse && modelError) {
      throw modelError;
    }

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

export const analyzeResumeAts = async ({
  user,
  resumeData,
  targetRole = '',
  jobDescription = '',
  apiKey = '',
}) => {
  const decryptedConfig = user?.getDecryptedEmailConfig ? user.getDecryptedEmailConfig() : (user?.emailConfig || {});
  let openaiApiKey = decryptSecret(decryptedConfig?.openaiApiKey || user?.emailConfig?.openaiApiKey || user?.apiKeys?.openai) || ENV.OPENAI_API_KEY;
  let geminiApiKey = decryptSecret(decryptedConfig?.geminiApiKey || user?.emailConfig?.geminiApiKey || user?.apiKeys?.gemini) || ENV.GEMINI_API_KEY;

  if (apiKey) {
    const trimmedKey = String(apiKey).trim();
    if (trimmedKey.startsWith('sk-')) {
      openaiApiKey = trimmedKey;
    } else if (trimmedKey.startsWith('AIza')) {
      geminiApiKey = trimmedKey;
    } else {
      if (!geminiApiKey) geminiApiKey = trimmedKey;
      if (!openaiApiKey) openaiApiKey = trimmedKey;
    }
  }

  const preferredProvider = decryptedConfig?.aiProvider || user?.emailConfig?.aiProvider || user?.aiProvider || (openaiApiKey ? 'openai' : 'gemini');

  if (!openaiApiKey && !geminiApiKey) {
    const error = new Error('Please configure a valid OpenAI or Gemini API Key in Settings to run AI ATS Resume Analysis.');
    error.statusCode = 400;
    throw error;
  }

  const personal = resumeData?.personalInfo || {};
  const experiences = Array.isArray(resumeData?.experience) ? resumeData.experience : [];
  const projects = Array.isArray(resumeData?.projects) ? resumeData.projects : [];
  const educations = Array.isArray(resumeData?.education) ? resumeData.education : [];
  const skills = typeof resumeData?.skills === 'string'
    ? resumeData.skills
    : Object.values(resumeData?.skills || {}).filter(Boolean).join(', ');

  const resumeText = `
CANDIDATE NAME: ${personal.fullName || 'Candidate'}
TARGET ROLE: ${targetRole || personal.title || 'Software Engineer'}
EMAIL / LINKS: ${personal.email || ''} | GitHub: ${personal.github || ''} | LinkedIn: ${personal.linkedin || ''}

PROFESSIONAL SUMMARY:
${resumeData?.summary || 'No summary provided.'}

TECHNICAL SKILLS:
${skills || 'No skills listed.'}

WORK EXPERIENCE:
${experiences.length > 0 ? experiences.map((e) => `- ${e.role || 'Role'} at ${e.company || 'Company'} (${e.dates || 'Dates'}):\n  ${(e.bullets || []).filter(Boolean).join('\n  ')}`).join('\n\n') : 'No work experience listed.'}

PROJECTS:
${projects.length > 0 ? projects.map((p) => `- ${p.name || 'Project'} [${p.technologies || ''}] (${p.dates || ''}):\n  ${(p.bullets || []).filter(Boolean).join('\n  ')}`).join('\n\n') : 'No projects listed.'}

EDUCATION:
${educations.length > 0 ? educations.map((ed) => `- ${ed.degree || 'Degree'}, ${ed.institution || 'University'} (${ed.dates || ''})`).join('\n') : 'No education listed.'}
`.trim();

  const prompt = `
You are a senior technical recruiter and principal ATS (Applicant Tracking System) auditing engine used by Fortune 500 tech companies (Workday, Greenhouse, Lever, Taleo).
Analyze the candidate's resume against modern ATS scanning algorithms and industry hiring standards.

${targetRole ? `TARGET ROLE / DOMAIN: ${targetRole}` : ''}
${jobDescription ? `TARGET JOB DESCRIPTION TO MATCH AGAINST:\n${jobDescription}` : ''}

CANDIDATE RESUME TO EVALUATE:
${resumeText}

Conduct an exhaustive, objective audit. Return STRICT JSON with this exact schema:
{
  "atsScore": <integer between 40 and 96 representing overall ATS pass probability>,
  "rating": "<Needs Work | Fair | Good | Strong | Exceptional>",
  "roleMatchPercentage": <integer between 50 and 98>,
  "strengths": [
    "<Highlight a clear ATS compliance strength, e.g. well-defined technical keywords, clean layout readiness, live project URLs>",
    "<Highlight another strength>",
    "<Highlight another strength>"
  ],
  "criticalGaps": [
    "<Identify specific ATS blocker or gap, e.g. lack of quantifiable impact metrics (X% increase, latency reduction, throughput)>",
    "<Identify another clear gap, e.g. passive phrasing or missing cloud/testing keywords>"
  ],
  "missingKeywords": [
    "<keyword 1 highly relevant to target role>",
    "<keyword 2>",
    "<keyword 3>",
    "<keyword 4>",
    "<keyword 5>",
    "<keyword 6>"
  ],
  "improvedSummary": "<A completely rewritten, punchy, 3-4 sentence high-impact professional summary loaded with relevant ATS keywords, quantifiable orientation, and leadership verbs tailored to the target role>",
  "bulletImprovements": [
    {
      "section": "<Name of experience or project where the bullet comes from>",
      "original": "<A weak, vague, or metric-less bullet point from the candidate's resume>",
      "improved": "<The rewritten version using the STAR method: Strong Action Verb + Business Context + Quantifiable Metric / Impact>"
    }
  ],
  "quickTips": [
    "<Actionable 1-sentence tip to immediately boost recruiter callback rate>"
  ]
}

CRITICAL RULES:
- Do not invent experience the candidate doesn't have, but sharpen their existing achievements into quantifiable impact.
- Return ONLY the JSON object. Do not wrap in markdown or backticks.
`;

  const runGemini = async () => {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const geminiModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro'];
    let textResponse = null;
    let modelError = null;

    for (const mName of geminiModels) {
      try {
        const model = genAI.getGenerativeModel({ model: mName });
        const result = await model.generateContent(prompt);
        textResponse = result.response.text();
        break;
      } catch (err) {
        modelError = err;
        if (err.message?.includes('404') || err.message?.includes('not found') || err.message?.includes('no longer available')) {
          continue;
        }
        throw err;
      }
    }

    if (!textResponse && modelError) throw modelError;

    let cleanJson = textResponse.trim();
    if (cleanJson.includes('```json')) {
      cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
    } else if (cleanJson.includes('```')) {
      cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse AI response into structured JSON.');
      }
    }
    return { ...parsed, provider: 'gemini' };
  };

  const runOpenAI = async () => {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical ATS compliance analyzer. You output only valid JSON matching the requested schema.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return { ...parsed, provider: 'openai' };
  };

  let lastError = null;

  if (preferredProvider === 'openai' && openaiApiKey) {
    try {
      return await runOpenAI();
    } catch (err) {
      lastError = err;
      if (geminiApiKey) {
        try {
          return await runGemini();
        } catch (geminiErr) {
          lastError = geminiErr;
        }
      }
    }
  } else if (geminiApiKey) {
    try {
      return await runGemini();
    } catch (err) {
      lastError = err;
      if (openaiApiKey) {
        try {
          return await runOpenAI();
        } catch (openAiErr) {
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

  if (lastError) {
    const error = new Error(`AI ATS audit failed: ${lastError.message || 'Check your API key in Settings'}`);
    error.statusCode = 400;
    throw error;
  }

  throw new Error('Unable to run AI ATS audit. Please verify your API key in Settings.');
};


