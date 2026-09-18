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
      console.warn('[OpenAI] Call failed, attempting fallback:', err.message);
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
      console.warn('[Gemini AI] Call failed or quota exceeded, falling back to smart template generator:', err.message);
    }
  }

  // 3. Smart Dynamic Fallback Generator (Always succeeds)
  const greetings = recipientName && recipientName.toLowerCase() !== 'hiring manager' && recipientName.toLowerCase() !== 'hiring team'
    ? `Dear ${recipientName},`
    : `Dear Hiring Team at ${companyName},`;

  const skillsHighlight = candidateSkills ? `My core technical stack includes ${candidateSkills}.` : 'I have extensive hands-on experience delivering scalable software solutions.';
  
  const jdMention = jobDescription 
    ? `Having reviewed the requirements for the ${position} role, I am confident that my background directly aligns with what ${companyName} is looking for.`
    : `I have been following ${companyName}'s impressive work and would love to contribute to your team as a ${position}.`;

  const subject = `Application for ${position} - ${candidateName}`;
  const body = `${greetings}

I hope this email finds you well.

${jdMention} ${skillsHighlight}

Throughout my career, I have focused on writing clean, maintainable code, designing scalable backend architectures, and crafting responsive user experiences. I thrive in high-ownership environments where I can solve challenging technical problems and deliver measurable product impact.

I have attached my resume for your review. You can also explore my portfolio and code repositories:
${candidatePortfolio ? `• Portfolio: ${candidatePortfolio}\n` : ''}${candidateGithub ? `• GitHub: ${candidateGithub}\n` : ''}${candidateLinkedin ? `• LinkedIn: ${candidateLinkedin}\n` : ''}
I would welcome the opportunity to discuss how my skill set can support ${companyName}'s upcoming goals. Are you open for a brief 10-minute conversation this week?

Thank you for your time and consideration.

Warm regards,
${candidateName}
${user?.email ? user.email : ''}`;

  return {
    subject,
    body: body.trim(),
    generatedBy: 'smart-template-engine',
    warnings: (openaiApiKey || geminiApiKey) ? [] : ['AI API Key not set. Used smart personalization template.'],
  };
};
