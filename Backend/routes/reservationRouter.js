const express = require('express');
const resController = require('../controllers/reservation.controller.js');

const authMiddleware = require('../Middlewares/myMiddleWares/authMiddleware.js');

const router = express.Router();

// POST /reserve/:bookId
router.post(
  '/reserve/:bookId',
  authMiddleware,
  resController.createReservation
);

// GET /reservations/:userId
router.get(
  '/reservations/:userId',
  authMiddleware,
  resController.getUserReservations
);

// DELETE /reserve/:reservationId
router.delete(
  '/reserve/:reservationId',
  authMiddleware,
  resController.cancelReservation
);

module.exports = router;
