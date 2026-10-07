const mongoose = require('mongoose');
const { store, generateId } = require('../utils/embeddedStore');

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    coverLetter: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['APPLIED', 'UNDER REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'],
      default: 'APPLIED'
    },
    appliedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const MongooseApplication = mongoose.model('Application', applicationSchema);

const HybridApplication = {
  find(query = {}) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseApplication.find(query);
    }

    let results = store.data.applications.filter((a) => {
      if (query.applicant && a.applicant !== query.applicant.toString()) return false;
      if (query.employer && a.employer !== query.employer.toString()) return false;
      if (query.job && a.job !== query.job.toString()) return false;
      if (query.status && a.status !== query.status) return false;
      if (query.appliedAt && query.appliedAt.$gte) {
        if (new Date(a.appliedAt) < new Date(query.appliedAt.$gte)) return false;
      }
      return true;
    });

    const queryChain = {
      populate(field, select) {
        return queryChain;
      },
      sort(criteria) {
        results.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        return queryChain;
      },
      limit(n) {
        results = results.slice(0, n);
        return queryChain;
      },
      then(resolve) {
        const enriched = results.map((app) => {
          const job = store.data.jobs.find((j) => j._id === app.job);
          const applicant = store.data.users.find((u) => u._id === app.applicant);
          const employer = store.data.users.find((u) => u._id === app.employer);

          const copy = { ...app };
          if (job) copy.job = store.wrapJob(job);
          if (applicant) copy.applicant = store.wrapUser(applicant);
          if (employer) copy.employer = store.wrapUser(employer);

          return store.wrapApplication(copy);
        });
        return resolve(enriched);
      }
    };

    return queryChain;
  },

  async findOne(query) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseApplication.findOne(query);
    }
    const raw = store.data.applications.find((a) => {
      if (query.job && a.job !== query.job.toString()) return false;
      if (query.applicant && a.applicant !== query.applicant.toString()) return false;
      return true;
    });
    return store.wrapApplication(raw);
  },

  async findById(id) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseApplication.findById(id);
    }
    const strId = id ? id.toString() : '';
    const raw = store.data.applications.find((a) => a._id === strId);
    return store.wrapApplication(raw);
  },

  async countDocuments(query = {}) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseApplication.countDocuments(query);
    }
    const list = await this.find(query);
    return list.length;
  },

  async create(appData) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseApplication.create(appData);
    }
    const doc = {
      ...appData,
      _id: generateId(),
      job: appData.job ? appData.job.toString() : '',
      applicant: appData.applicant ? appData.applicant.toString() : '',
      employer: appData.employer ? appData.employer.toString() : '',
      status: appData.status || 'APPLIED',
      appliedAt: appData.appliedAt ? new Date(appData.appliedAt).toISOString() : new Date().toISOString()
    };
    store.data.applications.push(doc);
    store.save();
    return store.wrapApplication(doc);
  },

  async deleteMany(query = {}) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseApplication.deleteMany(query);
    }
    if (query.job) {
      store.data.applications = store.data.applications.filter((a) => a.job !== query.job.toString());
    } else {
      store.data.applications = [];
    }
    store.save();
    return { deletedCount: 0 };
  }
};

module.exports = HybridApplication;
