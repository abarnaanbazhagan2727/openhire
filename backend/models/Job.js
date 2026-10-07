const mongoose = require('mongoose');
const { store, generateId } = require('../utils/embeddedStore');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    location: { type: String, required: true, trim: true },
    jobType: { type: String, default: 'Full Time' },
    workMode: { type: String, default: 'On-site' },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    experienceLevel: { type: String, default: 'Fresher' },
    applicationDeadline: { type: Date, required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['OPEN', 'FILLED'], default: 'OPEN' }
  },
  { timestamps: true }
);

const MongooseJob = mongoose.model('Job', jobSchema);

// Hybrid Model Adapter
const HybridJob = {
  find(query = {}) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseJob.find(query);
    }

    let results = store.data.jobs.filter((j) => {
      if (query.status && j.status !== query.status) return false;
      if (query.category && query.category !== 'All' && j.category !== query.category) return false;
      if (query.jobType && query.jobType !== 'All' && j.jobType !== query.jobType) return false;
      if (query.workMode && query.workMode !== 'All' && j.workMode !== query.workMode) return false;
      if (query.experienceLevel && query.experienceLevel !== 'All' && j.experienceLevel !== query.experienceLevel) return false;

      if (query.employer && j.employer !== query.employer.toString()) return false;

      if (query.location && !new RegExp(query.location, 'i').test(j.location)) return false;

      // $or search
      if (query.$or) {
        const matchesOr = query.$or.some((condition) => {
          if (condition.title && condition.title.$regex) {
            return new RegExp(condition.title.$regex, 'i').test(j.title);
          }
          if (condition.company && condition.company.$regex) {
            return new RegExp(condition.company.$regex, 'i').test(j.company);
          }
          if (condition.description && condition.description.$regex) {
            return new RegExp(condition.description.$regex, 'i').test(j.description);
          }
          if (condition.skills && condition.skills.$in) {
            return (j.skills || []).some((s) =>
              condition.skills.$in.some((regex) => regex.test(s))
            );
          }
          return false;
        });
        if (!matchesOr) return false;
      }

      return true;
    });

    let skipCount = 0;
    let limitCount = results.length;

    const queryChain = {
      populate(path, fields) {
        return queryChain;
      },
      select(fields) {
        return queryChain;
      },
      sort(criteria) {
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return queryChain;
      },
      skip(n) {
        skipCount = n;
        return queryChain;
      },
      limit(n) {
        limitCount = n;
        return queryChain;
      },
      then(resolve) {
        const paged = results.slice(skipCount, skipCount + limitCount).map((j) => store.wrapJob(j));
        return resolve(paged);
      }
    };

    return queryChain;
  },

  async findById(id) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseJob.findById(id);
    }
    const strId = id ? id.toString() : '';
    const raw = store.data.jobs.find((j) => j._id === strId);
    const wrapped = store.wrapJob(raw);

    const queryChain = {
      populate: () => queryChain,
      then: (resolve) => resolve(wrapped)
    };
    return queryChain;
  },

  async countDocuments(query = {}) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseJob.countDocuments(query);
    }
    const list = await this.find(query);
    return list.length;
  },

  async create(jobData) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseJob.create(jobData);
    }
    const doc = {
      ...jobData,
      _id: generateId(),
      employer: jobData.employer ? jobData.employer.toString() : '',
      status: jobData.status || 'OPEN',
      createdAt: new Date().toISOString()
    };
    store.data.jobs.push(doc);
    store.save();
    return store.wrapJob(doc);
  },

  async insertMany(jobsArray) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseJob.insertMany(jobsArray);
    }
    const created = jobsArray.map((jobData) => {
      const doc = {
        ...jobData,
        _id: generateId(),
        employer: jobData.employer ? jobData.employer.toString() : '',
        status: jobData.status || 'OPEN',
        createdAt: new Date().toISOString()
      };
      store.data.jobs.push(doc);
      return store.wrapJob(doc);
    });
    store.save();
    return created;
  },

  async deleteMany(query = {}) {
    if (process.env.USE_EMBEDDED_DB !== 'true') {
      return MongooseJob.deleteMany(query);
    }
    if (query.job) {
      store.data.jobs = store.data.jobs.filter((j) => j._id !== query.job.toString());
    } else {
      store.data.jobs = [];
    }
    store.save();
    return { deletedCount: 0 };
  }
};

module.exports = HybridJob;
