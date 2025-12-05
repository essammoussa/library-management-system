const express = require('express');
const returnController = require('../controllers/returnController.js');

const router = express.Router();

router.post('/return/:bookId', returnController.returnBook);
router.get('/return/history/:userId', returnController.userReturnHistory);

module.exports = router;
