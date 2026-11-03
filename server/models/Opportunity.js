const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job/Internship title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      trim: true,
      index: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    experience: {
      type: String,
      required: [true, 'Experience requirement is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Role description is required'],
      trim: true
    },
    applicationLink: {
      type: String,
      required: [true, 'Application link is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Internship', 'Full-Time', 'Part-Time', 'Contract'],
      default: 'Internship'
    },
    stipendOrSalary: {
      type: String,
      default: 'Competitive'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

opportunitySchema.index({ title: 1, companyName: 1, domain: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
