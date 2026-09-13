const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../Middlewares/myMiddleWares/authMiddleware');

const router = express.Router();

router.get('/stats', protect, adminOnly, dashboardController.getDashboardStats);
router.get('/activity', protect, adminOnly, dashboardController.getRecentActivity);

module.exports = router;
