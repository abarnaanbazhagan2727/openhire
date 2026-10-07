const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Please provide a job category'],
      enum: [
        'Software Development',
        'Data Science',
        'Artificial Intelligence',
        'Cybersecurity',
        'Cloud Computing',
        'UI/UX Design',
        'Marketing',
        'Finance'
      ]
    },
    company: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description']
    },
    responsibilities: {
      type: [String],
      default: []
    },
    requirements: {
      type: [String],
      default: []
    },
    skills: {
      type: [String],
      default: []
    },
    location: {
      type: String,
      required: [true, 'Please provide job location'],
      trim: true
    },
    jobType: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Internship', 'Contract', 'Remote'],
      default: 'Full Time'
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'On-site'
    },
    salaryMin: {
      type: Number,
      default: 0
    },
    salaryMax: {
      type: Number,
      default: 0
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', '1-3 Years', '3-5 Years', '5+ Years'],
      default: 'Fresher'
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Please provide an application deadline']
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['OPEN', 'FILLED'],
      default: 'OPEN'
    }
  },
  {
    timestamps: true
  }
);

// Virtual helper to check if deadline has passed
jobSchema.virtual('isExpired').get(function () {
  return new Date() > new Date(this.applicationDeadline);
});

module.exports = mongoose.model('Job', jobSchema);
