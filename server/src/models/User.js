import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { encryptSecret, decryptSecret } from '../services/cryptoService.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  title: {
    type: String,
    default: 'Software Engineer',
  },
  skills: [{
    type: String,
    trim: true,
  }],
  links: {
    portfolio: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  emailConfig: {
    provider: { type: String, enum: ['mock', 'smtp', 'resend'], default: 'mock' },
    senderName: { type: String, default: '' },
    senderEmail: { type: String, default: '' },
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    resendApiKey: { type: String, default: '' },
    geminiApiKey: { type: String, default: '' },
    openaiApiKey: { type: String, default: '' },
    aiProvider: { type: String, enum: ['auto', 'gemini', 'openai'], default: 'auto' },
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  // 1. Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // 2. Encrypt sensitive credentials at rest using AES-256-GCM
  if (this.emailConfig) {
    if (this.isModified('emailConfig.smtpPass') && this.emailConfig.smtpPass) {
      this.emailConfig.smtpPass = encryptSecret(this.emailConfig.smtpPass);
    }
    if (this.isModified('emailConfig.resendApiKey') && this.emailConfig.resendApiKey) {
      this.emailConfig.resendApiKey = encryptSecret(this.emailConfig.resendApiKey);
    }
    if (this.isModified('emailConfig.geminiApiKey') && this.emailConfig.geminiApiKey) {
      this.emailConfig.geminiApiKey = encryptSecret(this.emailConfig.geminiApiKey);
    }
    if (this.isModified('emailConfig.openaiApiKey') && this.emailConfig.openaiApiKey) {
      this.emailConfig.openaiApiKey = encryptSecret(this.emailConfig.openaiApiKey);
    }
  }

  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getDecryptedEmailConfig = function () {
  const cfg = (this.emailConfig && this.emailConfig.toObject) ? this.emailConfig.toObject() : { ...(this.emailConfig || {}) };
  return {
    ...cfg,
    smtpPass: decryptSecret(cfg.smtpPass),
    resendApiKey: decryptSecret(cfg.resendApiKey),
    geminiApiKey: decryptSecret(cfg.geminiApiKey),
    openaiApiKey: decryptSecret(cfg.openaiApiKey),
  };
};

export const User = mongoose.model('User', userSchema);

