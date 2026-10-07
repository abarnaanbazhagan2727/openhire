const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide contact email'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone'],
      trim: true
    },
    coverLetter: {
      type: String,
      default: ''
    },
    resumeUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: [
        'APPLIED',
        'UNDER REVIEW',
        'SHORTLISTED',
        'INTERVIEW',
        'ACCEPTED',
        'REJECTED'
      ],
      default: 'APPLIED'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate applications by same applicant to same job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
