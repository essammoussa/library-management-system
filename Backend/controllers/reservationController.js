const Reservation = require('../models/reservationModel');
const Book = require('../models/bookModel');

// ─── GET ALL RESERVATIONS ──────────────────────────────────────
exports.getAllReservations = async (req, res, next) => {
  try {
    const { status, memberId, bookId } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (memberId) query.userId = memberId;
    if (bookId) query.bookId = bookId;

    const reservations = await Reservation.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: reservations.map(normalizeReservation) });
  } catch (err) {
    next(err);
  }
};

// ─── GET RESERVATION BY ID ─────────────────────────────────────
exports.getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    res.json({ success: true, data: normalizeReservation(reservation) });
  } catch (err) {
    next(err);
  }
};

// ─── GET BY MEMBER ─────────────────────────────────────────────
exports.getByMember = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const User = require('../models/userModel');
    let userId = req.params.memberId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findOne({
        $or: [{ membershipId: userId }, { email: userId }],
      });
      if (user) {
        userId = user._id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const reservations = await Reservation.find({ userId })
      .sort({ priority: 1 });
    res.json({ success: true, data: reservations.map(normalizeReservation) });
  } catch (err) {
    next(err);
  }
};

// ─── GET BY BOOK ───────────────────────────────────────────────
exports.getByBook = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    let bookId = req.params.bookId;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      const Book = require('../models/bookModel');
      const book = await Book.findOne({
        $or: [{ isbn: bookId }, { title: bookId }],
      });
      if (book) {
        bookId = book._id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const reservations = await Reservation.find({ bookId })
      .sort({ priority: 1 });
    res.json({ success: true, data: reservations.map(normalizeReservation) });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE RESERVATION ────────────────────────────────────────
exports.createReservation = async (req, res, next) => {
  try {
    const { bookId, memberId, memberName, memberEmail, bookTitle, reservationDate, expiryDate, notes } = req.body;

    if (!bookId || !memberId) {
      return res.status(400).json({ success: false, message: 'bookId and memberId are required' });
    }

    // Auto queue position
    const lastReservation = await Reservation.findOne({ bookId, status: 'active' })
      .sort({ priority: -1 });
    const priority = lastReservation ? lastReservation.priority + 1 : 1;

    const reservation = await Reservation.create({
      bookId,
      bookTitle: bookTitle || '',
      userId: memberId,
      memberName: memberName || '',
      memberEmail: memberEmail || '',
      status: 'active',
      priority,
      reservationDate: reservationDate ? new Date(reservationDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created',
      data: normalizeReservation(reservation),
    });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE RESERVATION ────────────────────────────────────────
exports.updateReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    res.json({ success: true, data: normalizeReservation(reservation) });
  } catch (err) {
    next(err);
  }
};

// ─── CANCEL RESERVATION ────────────────────────────────────────
exports.cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    // Shift queue positions for remaining active reservations of same book
    await Reservation.updateMany(
      { bookId: reservation.bookId, status: 'active', priority: { $gt: reservation.priority } },
      { $inc: { priority: -1 } }
    );

    res.json({ success: true, message: 'Reservation cancelled', data: normalizeReservation(reservation) });
  } catch (err) {
    next(err);
  }
};

// ─── FULFILL RESERVATION ───────────────────────────────────────
exports.fulfillReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    reservation.status = 'fulfilled';
    await reservation.save();
    res.json({ success: true, message: 'Reservation fulfilled', data: normalizeReservation(reservation) });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE RESERVATION ────────────────────────────────────────
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── GET STATS ─────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const [total, active, fulfilled, expired, cancelled] = await Promise.all([
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: 'active' }),
      Reservation.countDocuments({ status: 'fulfilled' }),
      Reservation.countDocuments({ status: 'expired' }),
      Reservation.countDocuments({ status: 'cancelled' }),
    ]);
    res.json({ success: true, data: { total, active, fulfilled, expired, cancelled } });
  } catch (err) {
    next(err);
  }
};

// ─── GET NEXT IN QUEUE ─────────────────────────────────────────
exports.getNextInQueue = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({ bookId: req.params.bookId, status: 'active' })
      .sort({ priority: 1 });
    res.json({ success: true, data: reservation ? normalizeReservation(reservation) : null });
  } catch (err) {
    next(err);
  }
};

// ─── NORMALIZE ─────────────────────────────────────────────────
function normalizeReservation(r) {
  const obj = r.toJSON ? r.toJSON() : r;
  return {
    id: obj.id || obj._id?.toString(),
    bookId: obj.bookId?.toString(),
    bookTitle: obj.bookTitle || '',
    memberId: obj.userId?.toString(),
    memberName: obj.memberName || '',
    memberEmail: obj.memberEmail || '',
    status: obj.status,
    priority: obj.priority || 1,
    reservationDate: obj.reservationDate,
    expiryDate: obj.expiryDate,
    notes: obj.notes || '',
    createdAt: obj.createdAt,
  };
}
