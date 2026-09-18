import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['cold_outreach', 'follow_up', 'referral_request', 'post_interview', 'custom'],
    default: 'cold_outreach',
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
