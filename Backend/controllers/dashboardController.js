const User = require('../models/userModel');
const Book = require('../models/bookModel');
const Borrow = require('../models/borrowModel');
const Fine = require('../models/fineModel');
const Reservation = require('../models/reservationModel');

// ─── GET DASHBOARD STATS ──────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    // Update overdue borrows
    await Borrow.updateMany(
      { status: 'active', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    const [
      totalBooks,
      totalMembers,
      activeMembers,
      activeBorrows,
      overdueBorrows,
      totalBorrows,
      pendingFines,
      activeReservations,
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ role: 'member', status: 'active' }),
      Borrow.countDocuments({ status: 'active' }),
      Borrow.countDocuments({ status: 'overdue' }),
      Borrow.countDocuments(),
      Fine.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$fineAmount' } } },
      ]),
      Reservation.countDocuments({ status: 'active' }),
    ]);

    const totalFinesAmount = pendingFines.length > 0 ? pendingFines[0].total : 0;

    // Available books
    const availableBooks = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$availableCopies' } } },
    ]);
    const totalAvailable = availableBooks.length > 0 ? availableBooks[0].total : 0;

    res.json({
      success: true,
      data: {
        totalBooks,
        availableBooks: totalAvailable,
        totalMembers,
        activeMembers,
        activeBorrows,
        overdueBorrows,
        totalBorrows,
        pendingFinesAmount: totalFinesAmount,
        activeReservations,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET RECENT ACTIVITY ──────────────────────────────────────
exports.getRecentActivity = async (req, res, next) => {
  try {
    const recentBorrows = await Borrow.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentReservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        recentBorrows,
        recentReservations,
      },
    });
  } catch (err) {
    next(err);
  }
};
