const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate simple 24-hex ObjectId string
const generateId = () => {
  return [...Array(24)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
};

class EmbeddedStore {
  constructor() {
    this.data = {
      users: [],
      jobs: [],
      applications: [],
      savedJobs: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.warn('[EmbeddedStore] Initializing fresh database state.');
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('[EmbeddedStore] Error persisting database:', e.message);
    }
  }

  // Helper to wrap raw record into Mongoose-like document with methods
  wrapUser(doc) {
    if (!doc) return null;
    const item = { ...doc };
    item._id = item._id ? item._id.toString() : generateId();
    item.id = item._id;

    item.matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, item.password);
    };

    item.getProfileCompletion = function () {
      if (item.role === 'seeker') {
        const fields = [
          item.name,
          item.email,
          item.phone,
          item.location,
          item.skills && item.skills.length > 0 ? 'yes' : '',
          item.education,
          item.experience,
          item.resumeUrl,
          item.linkedin
        ];
        const filled = fields.filter((f) => Boolean(f && f.toString().trim())).length;
        return Math.round((filled / fields.length) * 100);
      } else {
        const fields = [
          item.name,
          item.email,
          item.companyName,
          item.companyDescription,
          item.companyWebsite,
          item.location,
          item.industry,
          item.companySize
        ];
        const filled = fields.filter((f) => Boolean(f && f.toString().trim())).length;
        return Math.round((filled / fields.length) * 100);
      }
    };

    item.save = async () => {
      const idx = this.data.users.findIndex((u) => u._id === item._id);
      if (idx !== -1) {
        this.data.users[idx] = { ...item };
        this.save();
      }
      return item;
    };

    item.toObject = () => ({ ...item });

    return item;
  }

  wrapJob(doc) {
    if (!doc) return null;
    const item = { ...doc };
    item._id = item._id ? item._id.toString() : generateId();
    item.id = item._id;

    item.isExpired = new Date() > new Date(item.applicationDeadline);

    item.save = async () => {
      const idx = this.data.jobs.findIndex((j) => j._id === item._id);
      if (idx !== -1) {
        this.data.jobs[idx] = { ...item };
        this.save();
      }
      return item;
    };

    item.deleteOne = async () => {
      this.data.jobs = this.data.jobs.filter((j) => j._id !== item._id);
      this.data.applications = this.data.applications.filter((a) => a.job !== item._id && a.job?._id !== item._id);
      this.data.savedJobs = this.data.savedJobs.filter((s) => s.job !== item._id && s.job?._id !== item._id);
      this.save();
      return true;
    };

    item.toObject = () => ({ ...item });

    return item;
  }

  wrapApplication(doc) {
    if (!doc) return null;
    const item = { ...doc };
    item._id = item._id ? item._id.toString() : generateId();
    item.id = item._id;

    item.save = async () => {
      const idx = this.data.applications.findIndex((a) => a._id === item._id);
      if (idx !== -1) {
        this.data.applications[idx] = { ...item };
        this.save();
      }
      return item;
    };

    item.toObject = () => ({ ...item });

    return item;
  }

  wrapSavedJob(doc) {
    if (!doc) return null;
    const item = { ...doc };
    item._id = item._id ? item._id.toString() : generateId();
    item.id = item._id;
    item.toObject = () => ({ ...item });
    return item;
  }
}

const store = new EmbeddedStore();
module.exports = { store, generateId };
