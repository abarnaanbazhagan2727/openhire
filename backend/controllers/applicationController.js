const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Seeker only)
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, fullName, email, phone, coverLetter, resumeUrl } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required.'
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    // Check if job is filled
    if (job.status === 'FILLED') {
      return res.status(400).json({
        success: false,
        message: 'This job has already been filled and is no longer accepting applications.'
      });
    }

    // Check if application deadline passed
    if (new Date() > new Date(job.applicationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'This job deadline has passed. Applications are closed.'
      });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job.'
      });
    }

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      employer: job.employer,
      fullName: fullName || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.phone || 'Not provided',
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || req.user.resumeUrl || '',
      status: 'APPLIED'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Track your status on your dashboard.',
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications submitted by logged-in Job Seeker
// @route   GET /api/applications/my
// @access  Private (Seeker only)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title category company location jobType workMode salaryMin salaryMax status applicationDeadline')
      .populate('employer', 'name email companyName companyWebsite')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a specific job (Employer only)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view applications for this job.'
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone location skills education experience resumeUrl portfolio linkedin')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      jobTitle: job.title,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications across all jobs for the employer
// @route   GET /api/applications/employer/all
// @access  Private (Employer only)
const getAllEmployerApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ employer: req.user._id })
      .populate('job', 'title category location jobType status')
      .populate('applicant', 'name email phone location skills education experience resumeUrl portfolio linkedin')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Employer only)
// @route   PATCH /api/applications/:id/status
// @access  Private (Employer only)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['APPLIED', 'UNDER REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    if (application.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage this application.'
      });
    }

    application.status = status;
    await application.save();

    res.json({
      success: true,
      message: `Applicant status updated to ${status}.`,
      application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getAllEmployerApplications,
  updateApplicationStatus
};
