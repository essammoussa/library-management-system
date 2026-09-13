const express = require('express');
const resController = require('../controllers/reservationController');
const { protect, adminOnly } = require('../Middlewares/myMiddleWares/authMiddleware');

const router = express.Router();

// Stats
router.get('/stats', protect, resController.getStats);

// Get all reservations
router.get('/', protect, resController.getAllReservations);

// By member / book
router.get('/member/:memberId', protect, resController.getByMember);
router.get('/book/:bookId', protect, resController.getByBook);
router.get('/book/:bookId/next', protect, resController.getNextInQueue);

// CRUD
router.post('/', protect, resController.createReservation);
router.get('/:id', protect, resController.getReservationById);
router.put('/:id', protect, resController.updateReservation);
router.delete('/:id', protect, resController.deleteReservation);

// Special actions
router.post('/:id/cancel', protect, resController.cancelReservation);
router.post('/:id/fulfill', protect, adminOnly, resController.fulfillReservation);

module.exports = router;
