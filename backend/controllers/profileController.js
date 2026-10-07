const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      });
    }

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        skills: user.skills,
        education: user.education,
        experience: user.experience,
        resumeUrl: user.resumeUrl,
        portfolio: user.portfolio,
        linkedin: user.linkedin,
        companyName: user.companyName,
        companyDescription: user.companyDescription,
        companyWebsite: user.companyWebsite,
        industry: user.industry,
        companySize: user.companySize,
        profileImage: user.profileImage,
        profileCompletion: user.getProfileCompletion()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      });
    }

    const {
      name,
      phone,
      location,
      skills,
      education,
      experience,
      resumeUrl,
      portfolio,
      linkedin,
      companyName,
      companyDescription,
      companyWebsite,
      industry,
      companySize
    } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) user.location = location.trim();

    if (user.role === 'seeker') {
      if (skills !== undefined) {
        user.skills = Array.isArray(skills)
          ? skills
          : typeof skills === 'string'
          ? skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
      }
      if (education !== undefined) user.education = education;
      if (experience !== undefined) user.experience = experience;
      if (resumeUrl !== undefined) user.resumeUrl = resumeUrl.trim();
      if (portfolio !== undefined) user.portfolio = portfolio.trim();
      if (linkedin !== undefined) user.linkedin = linkedin.trim();
    } else if (user.role === 'employer') {
      if (companyName !== undefined) user.companyName = companyName.trim();
      if (companyDescription !== undefined) user.companyDescription = companyDescription.trim();
      if (companyWebsite !== undefined) user.companyWebsite = companyWebsite.trim();
      if (industry !== undefined) user.industry = industry.trim();
      if (companySize !== undefined) user.companySize = companySize.trim();
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        skills: user.skills,
        education: user.education,
        experience: user.experience,
        resumeUrl: user.resumeUrl,
        portfolio: user.portfolio,
        linkedin: user.linkedin,
        companyName: user.companyName,
        companyDescription: user.companyDescription,
        companyWebsite: user.companyWebsite,
        industry: user.industry,
        companySize: user.companySize,
        profileImage: user.profileImage,
        profileCompletion: user.getProfileCompletion()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
