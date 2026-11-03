const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: [true, 'Opportunity ID reference is required'],
      index: true
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    opportunitySnapshot: {
      title: { type: String, default: '' },
      companyName: { type: String, default: '' },
      domain: { type: String, default: '' },
      location: { type: String, default: '' },
      type: { type: String, default: '' }
    },
    applicantName: {
      type: String,
      required: [true, 'Applicant full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    resumeLink: {
      type: String,
      required: [true, 'Resume URL is required'],
      trim: true
    },
    coverLetter: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewing', 'Shortlisted', 'Accepted', 'Rejected'],
      default: 'Pending'
    },
    adminNotes: {
      type: String,
      trim: true,
      default: ''
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound index to help query applications by opportunity and email
applicationSchema.index({ opportunityId: 1, email: 1 });

module.exports = mongoose.model('Application', applicationSchema);
