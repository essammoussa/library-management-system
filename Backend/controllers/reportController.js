const Borrow = require('../models/borrowModel');
const Book = require('../models/bookModel');
const User = require('../models/userModel');

// =========================
// 1. Most Borrowed Books
// =========================

const getMostBorrowedBooks = async (req, res) => {
  try {
    const data = await Borrow.aggregate([
      {
        $group: {
          _id: '$book',
          borrowCount: { $sum: 1 },
        },
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: Book.collection.name, // use Book model's collection name
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
    ]);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// 2. Overdue Books
// =========================

const getOverdueBooks = async (req, res) => {
  try {
    const today = new Date();

    const overdue = await Borrow.find({
      returnedAt: null, // still not returned
      dueDate: { $lt: today }, // past due date
    })
      .populate('book', 'title author')
      .populate('user', 'name email');

    res.status(200).json(overdue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// 3. Inventory Report
// =========================

const getInventoryReport = async (req, res) => {
  try {
    const inventory = await Book.find().select(
      'title author totalCopies availableCopies genre status'
    );

    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// 4. Most Active Members
// =========================

const getMostActiveMembers = async (req, res) => {
  try {
    const data = await Borrow.aggregate([
      {
        $group: {
          _id: '$user',
          borrowCount: { $sum: 1 },
        },
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: User.collection.name, // use User model's collection name
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ]);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMostBorrowedBooks,
  getOverdueBooks,
  getInventoryReport,
  getMostActiveMembers,
};
