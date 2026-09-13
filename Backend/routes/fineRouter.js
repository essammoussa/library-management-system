const express = require('express');
const finesController = require('../controllers/finesController');
const { protect, adminOnly } = require('../Middlewares/myMiddleWares/authMiddleware');

const router = express.Router();

// Get all fines (admin) with optional ?status=pending|paid|waived&memberId=xxx
router.get('/', protect, adminOnly, finesController.getAllFines);

// Bulk delete
router.post('/bulk-delete', protect, adminOnly, finesController.bulkDeleteFines);

// By member
router.get('/member/:memberId', protect, finesController.getFinesByMember);

// Single fine
router.get('/:id', protect, finesController.getFineById);
router.post('/', protect, adminOnly, finesController.createFine);
router.put('/:id', protect, adminOnly, finesController.updateFine);
router.delete('/:id', protect, adminOnly, finesController.deleteFine);

// Special actions
router.post('/:id/pay', protect, finesController.markAsPaid);
router.post('/:id/waive', protect, adminOnly, finesController.waiveFine);

module.exports = router;
