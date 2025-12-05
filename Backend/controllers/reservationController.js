const Reservation = require('../models/reservation.model.js');
const Book = require('../models/book.model.js');

// =============== Create Reservation ===================

exports.createReservation = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Book must be borrowed to allow reservation
    if (book.status === 'available') {
      return res.status(400).json({
        message: 'Book is currently available no need for reservation',
      });
    }

    // Auto queue position
    const lastReservation = await Reservation.find({ book: bookId })
      .sort({ queuePosition: -1 })
      .limit(1);

    const queuePosition =
      lastReservation.length > 0 ? lastReservation[0].queuePosition + 1 : 1;

    const newReservation = await Reservation.create({
      user: userId,
      book: bookId,
      queuePosition,
    });

    res.status(201).json({
      message: 'Book reserved successfully',
      reservation: newReservation,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============ Get Reservations By User ===============

exports.getUserReservations = async (req, res) => {
  try {
    const { userId } = req.params;

    const reservations = await Reservation.find({ user: userId })
      .populate('book', 'title author')
      .sort({ queuePosition: 1 });

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================ Cancel Reservation =================

exports.cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findById(reservationId);

    if (!reservation)
      return res.status(404).json({ message: 'Reservation not found' });

    reservation.status = 'cancelled';
    await reservation.save();

    // Shift queue positions
    await Reservation.updateMany(
      {
        book: reservation.book,
        queuePosition: { $gt: reservation.queuePosition },
      },
      { $inc: { queuePosition: -1 } }
    );

    res.status(200).json({ message: 'Reservation cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
