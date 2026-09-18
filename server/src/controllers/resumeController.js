import fs from 'fs';
import path from 'path';
import { Resume } from '../models/Resume.js';
import { generateResumePdf } from '../services/pdfService.js';

export const listResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, resumes });
  } catch (err) {
    next(err);
  }
};

export const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' } });
    }
    res.json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

export const uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE_UPLOADED', message: 'Please attach a valid PDF or Word document.' },
      });
    }

    const { title, versionTag, isDefault } = req.body;

    if (isDefault === 'true' || isDefault === true) {
      await Resume.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const resume = await Resume.create({
      userId: req.user._id,
      title: title || req.file.originalname,
      versionTag: versionTag || 'General',
      type: 'uploaded',
      isDefault: isDefault === 'true' || isDefault === true,
      filePath: req.file.path,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

export const createOrUpdateBuilderResume = async (req, res, next) => {
  try {
    const { title, versionTag, isDefault, builderData } = req.body;
    const resumeId = req.params.id;

    if (isDefault) {
      await Resume.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    let resume;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
      if (!resume) {
        return res.status(404).json({ success: false, error: { message: 'Resume not found' } });
      }
      if (title) resume.title = title;
      if (versionTag) resume.versionTag = versionTag;
      if (typeof isDefault === 'boolean') resume.isDefault = isDefault;
      if (builderData) resume.builderData = builderData;
    } else {
      resume = new Resume({
        userId: req.user._id,
        title: title || 'My Professional Resume',
        versionTag: versionTag || 'Full Stack',
        type: 'builder',
        isDefault: !!isDefault,
        builderData: builderData || {},
      });
    }

    // Generate PDF for this builder resume
    try {
      const pdfResult = await generateResumePdf(resume);
      resume.filePath = pdfResult.filePath;
      resume.originalFileName = `${resume.title.replace(/\s+/g, '_')}.pdf`;
      resume.fileSize = pdfResult.fileSize;
      resume.mimeType = 'application/pdf';
    } catch (pdfErr) {
      console.warn('[PDF Generator Warning]:', pdfErr.message);
    }

    await resume.save();

    res.status(resumeId ? 200 : 201).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: { message: 'Resume not found' } });
    }

    if (resume.filePath && fs.existsSync(resume.filePath)) {
      try {
        fs.unlinkSync(resume.filePath);
      } catch (e) {
        console.error('Failed to remove local file:', e);
      }
    }

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const downloadResumeFile = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume || !resume.filePath || !fs.existsSync(resume.filePath)) {
      return res.status(404).json({ success: false, error: { message: 'Resume file not found on server' } });
    }

    res.download(resume.filePath, resume.originalFileName || 'Resume.pdf');
  } catch (err) {
    next(err);
  }
};
