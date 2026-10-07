const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Do not return password by default
    },
    role: {
      type: String,
      enum: ['seeker', 'employer'],
      default: 'seeker',
      required: true
    },
    phone: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    // Job Seeker Profile fields
    skills: {
      type: [String],
      default: []
    },
    education: {
      type: String,
      default: ''
    },
    experience: {
      type: String,
      default: ''
    },
    resumeUrl: {
      type: String,
      default: ''
    },
    portfolio: {
      type: String,
      default: ''
    },
    linkedin: {
      type: String,
      default: ''
    },
    // Employer Profile fields
    companyName: {
      type: String,
      default: ''
    },
    companyDescription: {
      type: String,
      default: ''
    },
    companyWebsite: {
      type: String,
      default: ''
    },
    industry: {
      type: String,
      default: ''
    },
    companySize: {
      type: String,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user-entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate profile completion percentage
userSchema.methods.getProfileCompletion = function () {
  if (this.role === 'seeker') {
    const fields = [
      this.name,
      this.email,
      this.phone,
      this.location,
      this.skills && this.skills.length > 0 ? 'yes' : '',
      this.education,
      this.experience,
      this.resumeUrl,
      this.linkedin
    ];
    const filled = fields.filter(f => Boolean(f && f.toString().trim())).length;
    return Math.round((filled / fields.length) * 100);
  } else {
    const fields = [
      this.name,
      this.email,
      this.companyName,
      this.companyDescription,
      this.companyWebsite,
      this.location,
      this.industry,
      this.companySize
    ];
    const filled = fields.filter(f => Boolean(f && f.toString().trim())).length;
    return Math.round((filled / fields.length) * 100);
  }
};

module.exports = mongoose.model('User', userSchema);
