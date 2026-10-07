const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { store, generateId } = require('../utils/embeddedStore');

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
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['seeker', 'employer'],
      default: 'seeker',
      required: true
    },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    skills: { type: [String], default: [] },
    education: { type: String, default: '' },
    experience: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    companyName: { type: String, default: '' },
    companyDescription: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    industry: { type: String, default: '' },
    companySize: { type: String, default: '' },
    profileImage: { type: String, default: '' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

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
    const filled = fields.filter((f) => Boolean(f && f.toString().trim())).length;
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
    const filled = fields.filter((f) => Boolean(f && f.toString().trim())).length;
    return Math.round((filled / fields.length) * 100);
  }
};

const MongooseUser = mongoose.model('User', userSchema);

// Hybrid Model Adapter
const HybridUser = {
  findOne(query) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseUser.findOne(query);
    }
    const email = query.email ? query.email.toLowerCase().trim() : null;
    const raw = store.data.users.find((u) => (email ? u.email === email : true));
    const wrapped = store.wrapUser(raw);
    const chain = {
      select: () => chain,
      then: (resolve) => resolve(wrapped)
    };
    return chain;
  },

  findById(id) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseUser.findById(id);
    }
    const strId = id ? id.toString() : '';
    const raw = store.data.users.find((u) => u._id === strId);
    const wrapped = store.wrapUser(raw);
    const chain = {
      select: () => chain,
      then: (resolve) => resolve(wrapped)
    };
    return chain;
  },

  async create(userData) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseUser.create(userData);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const userDoc = {
      ...userData,
      _id: generateId(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    store.data.users.push(userDoc);
    store.save();
    return store.wrapUser(userDoc);
  },

  async deleteMany(query = {}) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseUser.deleteMany(query);
    }
    store.data.users = [];
    store.save();
    return { deletedCount: 0 };
  }
};

module.exports = HybridUser;
