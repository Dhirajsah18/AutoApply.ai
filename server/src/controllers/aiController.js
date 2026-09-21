import mongoose from 'mongoose';
import { generateJobEmail, analyzeResumeAts } from '../services/aiService.js';
import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';


export const generateEmail = async (req, res, next) => {
  try {
    const {
      companyName,
      position,
      recipientName,
      jobDescription,
      tone,
      customInstructions,
      resumeId,
      apiKey,
    } = req.body;

    if (!companyName || !position) {
      return res.status(400).json({
        success: false,
        error: { message: 'Company Name and Position are required to generate an email.' },
      });
    }

    const user = await User.findById(req.user._id);
    let resume = null;

    if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    } else {
      // Find default resume or latest
      resume = await Resume.findOne({ userId: req.user._id, isDefault: true }) ||
               await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    const result = await generateJobEmail({
      user,
      resume,
      companyName,
      position,
      recipientName,
      jobDescription,
      tone,
      customInstructions,
      apiKey,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const personalizeTemplate = async (req, res, next) => {
  try {
    const { templateText, subjectText, companyName, position, recipientName, resumeId } = req.body;
    const user = await User.findById(req.user._id);

    let resume = null;
    if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    }

    const skills = resume?.builderData?.skills?.length
      ? resume.builderData.skills.join(', ')
      : (user.skills?.join(', ') || 'Full Stack Web Development');

    const vars = {
      '{{companyName}}': companyName || 'your company',
      '{{position}}': position || 'Software Engineer',
      '{{recipientName}}': recipientName || 'Hiring Manager',
      '{{userName}}': user.name || 'Applicant',
      '{{skills}}': skills,
      '{{portfolio}}': user.links?.portfolio || '',
      '{{github}}': user.links?.github || '',
      '{{linkedin}}': user.links?.linkedin || '',
    };

    let personalizedSubject = subjectText || '';
    let personalizedBody = templateText || '';

    for (const [key, val] of Object.entries(vars)) {
      personalizedSubject = personalizedSubject.replaceAll(key, val);
      personalizedBody = personalizedBody.replaceAll(key, val);
    }

    res.json({
      success: true,
      subject: personalizedSubject,
      body: personalizedBody,
    });
  } catch (err) {
    next(err);
  }
};

export const checkResumeAts = async (req, res, next) => {
  try {
    const { resumeData, targetRole, jobDescription, apiKey } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        error: { message: 'Resume data is required to run ATS audit.' },
      });
    }

    const user = await User.findById(req.user._id);

    const result = await analyzeResumeAts({
      user,
      resumeData,
      targetRole,
      jobDescription,
      apiKey,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

