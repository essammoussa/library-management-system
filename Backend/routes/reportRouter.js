const express = require('express');
const reportController = require('../controllers/reports.controller.js');

const authMiddleware = require('../middleware/auth.middleware.js');
const adminMiddleware = require('../middleware/admin.middleware.js');

const router = express.Router();

// Admin-only access
router.use(authMiddleware, adminMiddleware);

router.get('/reports/most-borrowed', getMostBorrowedBooks);
router.get('/reports/overdue', getOverdueBooks);
router.get('/reports/inventory', getInventoryReport);
router.get('/reports/active-members', getMostActiveMembers);

module.exports = router;
