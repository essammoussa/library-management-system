const express = require('express');
const finesController = require('../controllers/finesController.js');

const router = express.Router();

router.get('/fines/unpaid/:userId', finesController.getUnpaidFines);
router.post('/fines/pay/:fineId', finesController.payFine);
router.get('/fines/all', finesController.getAllFines); // admin endpoint

module.exports = router;
