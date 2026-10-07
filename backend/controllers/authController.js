const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validatePassword, validateEmail } = require('../utils/validation');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      location,
      companyName,
      companyDescription,
      companyWebsite
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered.'
      });
    }

    const userRole = role === 'employer' ? 'employer' : 'seeker';

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      phone: phone || '',
      location: location || ''
    };

    if (userRole === 'employer') {
      userData.companyName = companyName || name.trim() + ' Tech';
      userData.companyDescription = companyDescription || '';
      userData.companyWebsite = companyWebsite || '';
    }

    const user = await User.create(userData);

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to OpenHire.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        companyName: user.companyName,
        profileCompletion: user.getProfileCompletion()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful! Welcome back.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        skills: user.skills,
        companyName: user.companyName,
        profileCompletion: user.getProfileCompletion()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    res.json({
      success: true,
      user: {
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
        profileCompletion: user.getProfileCompletion()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    One-click Demo User Login (Job Seeker or Employer)
// @route   POST /api/auth/demo
// @access  Public
const demoLogin = async (req, res, next) => {
  try {
    const role = req.body.role === 'employer' ? 'employer' : 'seeker';
    const demoEmail = role === 'employer' ? 'employer.demo@openhire.dev' : 'seeker.demo@openhire.dev';

    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      // Create on the fly if not yet seeded
      user = await User.create({
        name: role === 'employer' ? 'TechNova Solutions HR' : 'Alex Rivera',
        email: demoEmail,
        password: 'Password123!',
        role,
        phone: '+91 98765 43210',
        location: 'Bangalore, India',
        skills: role === 'seeker' ? ['JavaScript', 'Node.js', 'React', 'MongoDB', 'CSS'] : [],
        companyName: role === 'employer' ? 'TechNova Solutions' : '',
        companyDescription: 'Pioneering intelligent enterprise cloud solutions and data infrastructure.',
        companyWebsite: 'https://technova.example.com',
        education: 'B.Tech in Computer Science',
        experience: '2 years as Full-Stack Engineer'
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: `Demo logged in as ${role === 'employer' ? 'Employer (TechNova)' : 'Job Seeker (Alex Rivera)'}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        skills: user.skills,
        companyName: user.companyName,
        profileCompletion: user.getProfileCompletion()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  demoLogin
};
