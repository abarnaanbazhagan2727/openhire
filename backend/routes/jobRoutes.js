const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getJobs);
router.get('/suggestions', getSearchSuggestions);

// Specific protected routes before /:id parameter to avoid collision
router.get('/saved', protect, authorize('seeker'), getSavedJobs);
router.get('/employer/my', protect, authorize('employer'), getMyEmployerJobs);

router.get('/:id', getJobById);

// Employer job management
router.post('/', protect, authorize('employer'), createJob);
router.put('/:id', protect, authorize('employer'), updateJob);
router.delete('/:id', protect, authorize('employer'), deleteJob);
router.patch('/:id/status', protect, authorize('employer'), updateJobStatus);

// Job bookmarking (Seeker)
router.post('/:id/save', protect, authorize('seeker'), saveJob);
router.delete('/:id/save', protect, authorize('seeker'), unsaveJob);

module.exports = router;
