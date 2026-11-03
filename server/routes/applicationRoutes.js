const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/applicationController');
const { protect, optionalAuth, adminOnly } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, ctrl.submit);
router.get('/', protect, adminOnly, ctrl.getAll);
router.get('/my-applications', protect, ctrl.getMyApplications);
router.put('/:id/status', protect, adminOnly, ctrl.updateStatus);
router.delete('/:id', protect, adminOnly, ctrl.remove);

module.exports = router;
