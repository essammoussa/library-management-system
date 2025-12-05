const express = require('express');
const borrowController = require('../controllers/borrowController');

const router = express.Router();

router.post('/:bookId', borrowController.borrowBook);
router.post('/return/:bookId', borrowController.returnBook);
router.get('/history/:userId', borrowController.borrowHistory);
router.get('/active', borrowController.activeBorrows);

module.exports = router;
