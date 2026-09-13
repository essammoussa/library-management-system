const express = require('express');
const borrowController = require('../controllers/borrowController');
const { protect } = require('../Middlewares/myMiddleWares/authMiddleware');

const router = express.Router();

// Stats
router.get('/stats', protect, borrowController.getBorrowStats);

// CRUD
router.get('/', protect, borrowController.getAllBorrows);
router.post('/', protect, borrowController.createBorrow);
router.get('/:id', protect, borrowController.getBorrowById);
router.put('/:id', protect, borrowController.updateBorrow);
router.delete('/:id', protect, borrowController.deleteBorrow);

// Special actions
router.post('/:id/return', protect, borrowController.returnBook);
router.post('/:id/renew', protect, borrowController.renewBorrow);

module.exports = router;
