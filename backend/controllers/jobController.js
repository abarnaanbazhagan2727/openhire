const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');

// @desc    Get all jobs with rich filtering, search and pagination
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      category,
      location,
      jobType,
      workMode,
      experienceLevel,
      datePosted,
      salaryMin,
      salaryMax,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // By default, public search only shows OPEN jobs unless explicitly asked
    if (status) {
      query.status = status;
    } else {
      query.status = 'OPEN';
    }

    // Text search on title, company, skills, or description
    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { company: { $regex: term, $options: 'i' } },
        { skills: { $in: [new RegExp(term, 'i')] } },
        { description: { $regex: term, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Location filter
    if (location && location.trim() !== '') {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Job Type filter
    if (jobType && jobType !== 'All') {
      query.jobType = jobType;
    }

    // Work Mode filter
    if (workMode && workMode !== 'All') {
      query.workMode = workMode;
    }

    // Experience Level filter
    if (experienceLevel && experienceLevel !== 'All') {
      query.experienceLevel = experienceLevel;
    }

    // Salary filter
    if (salaryMin) {
      query.salaryMax = { $gte: Number(salaryMin) };
    }
    if (salaryMax) {
      query.salaryMin = { $lte: Number(salaryMax) };
    }

    // Date Posted filter
    if (datePosted && datePosted !== 'Anytime') {
      const now = new Date();
      let pastDate = new Date();

      if (datePosted === 'Today') {
        pastDate.setHours(0, 0, 0, 0);
      } else if (datePosted === 'Last 3 Days') {
        pastDate.setDate(now.getDate() - 3);
      } else if (datePosted === 'Last Week') {
        pastDate.setDate(now.getDate() - 7);
      } else if (datePosted === 'Last Month') {
        pastDate.setDate(now.getDate() - 30);
      }

      query.createdAt = { $gte: pastDate };
    }

    const currentPage = parseInt(page, 10) || 1;
    const pageLimit = parseInt(limit, 10) || 20;
    const skip = (currentPage - 1) * pageLimit;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('employer', 'name email companyName companyWebsite companyDescription location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    res.json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / pageLimit) || 1,
      currentPage,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'employer',
      'name email companyName companyDescription companyWebsite location industry companySize'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    const isExpired = new Date() > new Date(job.applicationDeadline);

    res.json({
      success: true,
      job: {
        ...job.toObject(),
        isExpired
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      category,
      company,
      description,
      responsibilities,
      requirements,
      skills,
      location,
      jobType,
      workMode,
      salaryMin,
      salaryMax,
      experienceLevel,
      applicationDeadline
    } = req.body;

    if (!title || !category || !description || !location || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, category, description, location, and deadline.'
      });
    }

    // Process array/string fields
    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedResponsibilities = Array.isArray(responsibilities)
      ? responsibilities
      : typeof responsibilities === 'string'
      ? responsibilities.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedRequirements = Array.isArray(requirements)
      ? requirements
      : typeof requirements === 'string'
      ? requirements.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

    const job = await Job.create({
      title: title.trim(),
      category,
      company: company ? company.trim() : (req.user.companyName || req.user.name),
      description: description.trim(),
      responsibilities: parsedResponsibilities,
      requirements: parsedRequirements,
      skills: parsedSkills,
      location: location.trim(),
      jobType: jobType || 'Full Time',
      workMode: workMode || 'On-site',
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      experienceLevel: experienceLevel || 'Fresher',
      applicationDeadline: new Date(applicationDeadline),
      employer: req.user._id,
      status: 'OPEN'
    });

    res.status(201).json({
      success: true,
      message: 'Job posting published successfully!',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Employer only - must own the job)
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    // Ownership check
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this job.'
      });
    }

    const {
      title,
      category,
      company,
      description,
      responsibilities,
      requirements,
      skills,
      location,
      jobType,
      workMode,
      salaryMin,
      salaryMax,
      experienceLevel,
      applicationDeadline,
      status
    } = req.body;

    if (title) job.title = title.trim();
    if (category) job.category = category;
    if (company) job.company = company.trim();
    if (description) job.description = description.trim();
    if (location) job.location = location.trim();
    if (jobType) job.jobType = jobType;
    if (workMode) job.workMode = workMode;
    if (salaryMin !== undefined) job.salaryMin = Number(salaryMin);
    if (salaryMax !== undefined) job.salaryMax = Number(salaryMax);
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (applicationDeadline) job.applicationDeadline = new Date(applicationDeadline);
    if (status && ['OPEN', 'FILLED'].includes(status)) job.status = status;

    if (skills !== undefined) {
      job.skills = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : job.skills;
    }

    if (responsibilities !== undefined) {
      job.responsibilities = Array.isArray(responsibilities)
        ? responsibilities
        : typeof responsibilities === 'string'
        ? responsibilities.split('\n').map((s) => s.trim()).filter(Boolean)
        : job.responsibilities;
    }

    if (requirements !== undefined) {
      job.requirements = Array.isArray(requirements)
        ? requirements
        : typeof requirements === 'string'
        ? requirements.split('\n').map((s) => s.trim()).filter(Boolean)
        : job.requirements;
    }

    await job.save();

    res.json({
      success: true,
      message: 'Job updated successfully!',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only - must own the job)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    // Ownership check
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this job.'
      });
    }

    // Cascade delete associated applications and bookmarks
    await Application.deleteMany({ job: job._id });
    await SavedJob.deleteMany({ job: job._id });
    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job deleted successfully along with associated records.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or update job status ('OPEN' | 'FILLED')
// @route   PATCH /api/jobs/:id/status
// @access  Private (Employer only)
const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['OPEN', 'FILLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be OPEN or FILLED.'
      });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this job.'
      });
    }

    job.status = status;
    await job.save();

    res.json({
      success: true,
      message: `Job status marked as ${status}.`,
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs created by the logged in employer
// @route   GET /api/jobs/employer/my
// @access  Private (Employer only)
const getMyEmployerJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });

    // Attach application count to each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicationCount
        };
      })
    );

    res.json({
      success: true,
      count: jobsWithStats.length,
      jobs: jobsWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search suggestions autocomplete
// @route   GET /api/jobs/suggestions
// @access  Public
const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const regex = new RegExp(q.trim(), 'i');

    const matchingJobs = await Job.find({
      $or: [{ title: regex }, { skills: { $in: [regex] } }, { company: regex }]
    })
      .select('title company skills')
      .limit(8);

    const suggestionSet = new Set();
    matchingJobs.forEach((job) => {
      if (regex.test(job.title)) suggestionSet.add(job.title);
      if (regex.test(job.company)) suggestionSet.add(job.company);
      job.skills.forEach((skill) => {
        if (regex.test(skill)) suggestionSet.add(skill);
      });
    });

    res.json({
      success: true,
      suggestions: Array.from(suggestionSet).slice(0, 6)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/bookmark a job
// @route   POST /api/jobs/:id/save
// @access  Private (Seeker only)
const saveJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    const existing = await SavedJob.findOne({
      user: req.user._id,
      job: req.params.id
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Job already saved.',
        saved: true
      });
    }

    await SavedJob.create({
      user: req.user._id,
      job: req.params.id
    });

    res.status(201).json({
      success: true,
      message: 'Job saved to your bookmarks!',
      saved: true
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove job from saved bookmarks
// @route   DELETE /api/jobs/:id/save
// @access  Private (Seeker only)
const unsaveJob = async (req, res, next) => {
  try {
    await SavedJob.findOneAndDelete({
      user: req.user._id,
      job: req.params.id
    });

    res.json({
      success: true,
      message: 'Job removed from saved bookmarks.',
      saved: false
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved jobs for current user
// @route   GET /api/jobs/saved
// @access  Private (Seeker only)
const getSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ user: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'employer', select: 'companyName companyWebsite' }
      })
      .sort({ createdAt: -1 });

    const jobs = saved.map((s) => s.job).filter(Boolean);

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getMyEmployerJobs,
  getSearchSuggestions,
  saveJob,
  unsaveJob,
  getSavedJobs
};
