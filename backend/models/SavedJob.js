const mongoose = require('mongoose');
const { store, generateId } = require('../utils/embeddedStore');

const savedJobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

const MongooseSavedJob = mongoose.model('SavedJob', savedJobSchema);

const HybridSavedJob = {
  find(query = {}) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseSavedJob.find(query);
    }

    let results = store.data.savedJobs.filter((s) => {
      if (query.user && s.user !== query.user.toString()) return false;
      if (query.job && s.job !== query.job.toString()) return false;
      return true;
    });

    const queryChain = {
      populate(options) {
        return queryChain;
      },
      sort(criteria) {
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return queryChain;
      },
      limit(n) {
        results = results.slice(0, n);
        return queryChain;
      },
      then(resolve) {
        const enriched = results.map((item) => {
          const job = store.data.jobs.find((j) => j._id === item.job);
          const copy = { ...item };
          if (job) copy.job = store.wrapJob(job);
          return store.wrapSavedJob(copy);
        });
        return resolve(enriched);
      }
    };

    return queryChain;
  },

  async findOne(query) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseSavedJob.findOne(query);
    }
    const raw = store.data.savedJobs.find((s) => {
      if (query.user && s.user !== query.user.toString()) return false;
      if (query.job && s.job !== query.job.toString()) return false;
      return true;
    });
    return store.wrapSavedJob(raw);
  },

  async create(data) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseSavedJob.create(data);
    }
    const doc = {
      _id: generateId(),
      user: data.user ? data.user.toString() : '',
      job: data.job ? data.job.toString() : '',
      createdAt: new Date().toISOString()
    };
    store.data.savedJobs.push(doc);
    store.save();
    return store.wrapSavedJob(doc);
  },

  async findOneAndDelete(query) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseSavedJob.findOneAndDelete(query);
    }
    const idx = store.data.savedJobs.findIndex((s) => {
      if (query.user && s.user !== query.user.toString()) return false;
      if (query.job && s.job !== query.job.toString()) return false;
      return true;
    });
    if (idx !== -1) {
      const removed = store.data.savedJobs.splice(idx, 1)[0];
      store.save();
      return store.wrapSavedJob(removed);
    }
    return null;
  },

  async deleteMany(query = {}) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseSavedJob.deleteMany(query);
    }
    if (query.job) {
      store.data.savedJobs = store.data.savedJobs.filter((s) => s.job !== query.job.toString());
    } else {
      store.data.savedJobs = [];
    }
    store.save();
    return { deletedCount: 0 };
  }
};

module.exports = HybridSavedJob;
