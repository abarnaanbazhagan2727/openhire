const express = require('express');
const router = express.Router();
const {
  getSeekerDashboard,
  getEmployerDashboard
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/seeker', protect, authorize('seeker'), getSeekerDashboard);
router.get('/employer', protect, authorize('employer'), getEmployerDashboard);

module.exports = router;
