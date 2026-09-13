const express = require('express');
const {
  getMostBorrowedBooks,
  getOverdueBooks,
  getInventoryReport,
  getMostActiveMembers,
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../Middlewares/myMiddleWares/authMiddleware');

const router = express.Router();

// Admin-only access
router.get('/most-borrowed', protect, adminOnly, getMostBorrowedBooks);
router.get('/overdue', protect, adminOnly, getOverdueBooks);
router.get('/inventory', protect, adminOnly, getInventoryReport);
router.get('/active-members', protect, adminOnly, getMostActiveMembers);

module.exports = router;
