const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getAllEmployerApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Seeker routes
router.post('/', protect, authorize('seeker'), applyForJob);
router.get('/my', protect, authorize('seeker'), getMyApplications);

// Employer routes
router.get('/job/:jobId', protect, authorize('employer'), getJobApplications);
router.get('/employer/all', protect, authorize('employer'), getAllEmployerApplications);
router.patch('/:id/status', protect, authorize('employer'), updateApplicationStatus);

module.exports = router;
