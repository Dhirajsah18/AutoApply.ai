import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyContact',
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  recipientName: {
    type: String,
    default: 'Hiring Team',
    trim: true,
  },
  recipientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  jobUrl: {
    type: String,
    default: '',
  },
  jobDescription: {
    type: String,
    default: '',
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
  },
  resumeTitle: {
    type: String,
    default: '',
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'FOLLOW_UP_DUE', 'REPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'],
    default: 'DRAFT',
    index: true,
  },
  deliveryStatus: {
    type: String,
    enum: ['PENDING', 'DELIVERED', 'FAILED', 'BOUNCED'],
    default: 'PENDING',
  },
  sentAt: {
    type: Date,
  },
  followUpAt: {
    type: Date,
  },
  lastFollowUpAt: {
    type: Date,
  },
  followUpCount: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  providerMessageId: {
    type: String,
    default: '',
  },
  history: [{
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String, default: '' },
  }],
}, {
  timestamps: true,
});

export const Application = mongoose.model('Application', applicationSchema);
