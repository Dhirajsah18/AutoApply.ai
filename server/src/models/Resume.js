import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  versionTag: {
    type: String,
    default: 'General',
    trim: true,
  },
  type: {
    type: String,
    enum: ['uploaded', 'builder'],
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  // Uploaded file metadata
  filePath: {
    type: String,
    default: '',
  },
  originalFileName: {
    type: String,
    default: '',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  mimeType: {
    type: String,
    default: 'application/pdf',
  },
  // Resume Builder Structured Data
  builderData: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        portfolio: '',
        github: '',
        linkedin: '',
      },
      summary: '',
      education: [],
      experience: [],
      projects: [],
      skills: [],
      skillsCategories: {
        languages: '',
        frameworks: '',
        databases: '',
        tools: '',
        softSkills: '',
      },
      coursework: [],
      certifications: [],
    }),
  },
}, {
  timestamps: true,
  strict: false,
});

export const Resume = mongoose.model('Resume', resumeSchema);
