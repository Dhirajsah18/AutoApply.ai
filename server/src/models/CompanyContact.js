import mongoose from 'mongoose';

const companyContactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  contactName: {
    type: String,
    default: 'Hiring Manager',
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  position: {
    type: String,
    default: 'Software Engineer',
    trim: true,
  },
  location: {
    type: String,
    default: 'Remote',
    trim: true,
  },
  sourceUrl: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

export const CompanyContact = mongoose.model('CompanyContact', companyContactSchema);
