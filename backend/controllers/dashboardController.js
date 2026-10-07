const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');

// @desc    Get Job Seeker Dashboard metrics & recommendations
// @route   GET /api/dashboard/seeker
// @access  Private (Seeker only)
const getSeekerDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Statistics counts
    const totalApplications = await Application.countDocuments({ applicant: userId });
    const shortlistedCount = await Application.countDocuments({
      applicant: userId,
      status: 'SHORTLISTED'
    });
    const interviewCount = await Application.countDocuments({
      applicant: userId,
      status: 'INTERVIEW'
    });
    const offersCount = await Application.countDocuments({
      applicant: userId,
      status: 'ACCEPTED'
    });

    // Recent applications with populated job details
    const recentApplications = await Application.find({ applicant: userId })
      .populate('job', 'title category company location jobType salaryMin salaryMax status')
      .populate('employer', 'companyName companyWebsite')
      .sort({ appliedAt: -1 })
      .limit(5);

    // Saved jobs
    const savedJobs = await SavedJob.find({ user: userId })
      .populate('job')
      .sort({ createdAt: -1 })
      .limit(10);

    // Rule-based Job Recommendations
    // Match based on user skills and OPEN status
    let recommendedJobs = [];
    if (user.skills && user.skills.length > 0) {
      const skillRegexes = user.skills.map((s) => new RegExp(s.trim(), 'i'));
      recommendedJobs = await Job.find({
        status: 'OPEN',
        $or: [
          { skills: { $in: skillRegexes } },
          { title: { $in: skillRegexes } }
        ]
      })
        .limit(6)
        .sort({ createdAt: -1 });
    }

    // Fallback if no specific skills or no matches found
    if (recommendedJobs.length < 3) {
      const fallbackJobs = await Job.find({
        status: 'OPEN',
        _id: { $nin: recommendedJobs.map((j) => j._id) }
      })
        .limit(6 - recommendedJobs.length)
        .sort({ createdAt: -1 });
      recommendedJobs = [...recommendedJobs, ...fallbackJobs];
    }

    res.json({
      success: true,
      data: {
        profile: {
          name: user.name,
          email: user.email,
          profileCompletion: user.getProfileCompletion()
        },
        stats: {
          applications: totalApplications,
          shortlisted: shortlistedCount,
          interviews: interviewCount,
          offers: offersCount
        },
        recentApplications,
        savedJobs: savedJobs.map((s) => s.job).filter(Boolean),
        recommendedJobs
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employer Dashboard metrics & analytics
// @route   GET /api/dashboard/employer
// @access  Private (Employer only)
const getEmployerDashboard = async (req, res, next) => {
  try {
    const employerId = req.user._id;

    // Active Jobs & Filled Jobs
    const activeJobsCount = await Job.countDocuments({
      employer: employerId,
      status: 'OPEN'
    });
    const filledJobsCount = await Job.countDocuments({
      employer: employerId,
      status: 'FILLED'
    });

    // Total applicants & Shortlisted
    const totalApplicantsCount = await Application.countDocuments({ employer: employerId });
    const shortlistedCount = await Application.countDocuments({
      employer: employerId,
      status: 'SHORTLISTED'
    });

    // Weekly analytics (Past 7 days distribution)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const pastWeek = new Date();
    pastWeek.setDate(now.getDate() - 6);
    pastWeek.setHours(0, 0, 0, 0);

    const pastWeekApps = await Application.find({
      employer: employerId,
      appliedAt: { $gte: pastWeek }
    });

    const weeklyStats = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0
    };

    pastWeekApps.forEach((app) => {
      const dayName = daysOfWeek[new Date(app.appliedAt).getDay()];
      if (weeklyStats[dayName] !== undefined) {
        weeklyStats[dayName]++;
      }
    });

    // Recent applicants
    const recentApplicants = await Application.find({ employer: employerId })
      .populate('job', 'title category location')
      .populate('applicant', 'name email phone skills')
      .sort({ appliedAt: -1 })
      .limit(6);

    // Employer's recent jobs with applicant count
    const recentJobs = await Job.find({ employer: employerId })
      .sort({ createdAt: -1 })
      .limit(5);

    const jobsWithStats = await Promise.all(
      recentJobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicantCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        companyName: req.user.companyName || req.user.name,
        stats: {
          activeJobs: activeJobsCount,
          totalApplicants: totalApplicantsCount,
          shortlisted: shortlistedCount,
          jobsFilled: filledJobsCount
        },
        weeklyStats,
        recentApplicants,
        recentJobs: jobsWithStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSeekerDashboard,
  getEmployerDashboard
};
