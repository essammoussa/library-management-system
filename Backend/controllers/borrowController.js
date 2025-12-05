const Book = require('../models/bookModel.js');
const Borrow = require('../models/borrowModel.js');

// Borrow a book
exports.borrowBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check availability
    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    // Check if this user has overdue books
    const overdue = await Borrow.findOne({
      userId,
      returnedAt: null,
      dueDate: { $lt: new Date() },
    });

    if (overdue) {
      return res.status(400).json({ message: 'User has overdue books' });
    }

    // Create due date (14 days)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create borrowing record
    const borrow = new Borrow({
      userId,
      bookId,
      dueDate,
    });

    await borrow.save();

    // Reduce available copies
    book.availableCopies -= 1;
    await book.save();

    res.json({
      message: 'Book borrowed successfully',
      borrow,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Return a book
exports.returnBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Find active borrowing record
    const borrow = await Borrow.findOne({
      userId,
      bookId,
      returnedAt: null,
    });

    if (!borrow) {
      return res.status(404).json({
        message: 'This user has not borrowed this book or already returned it',
      });
    }

    // Mark as returned
    borrow.returnedAt = new Date();
    await borrow.save();

    // Increase available copies
    const book = await Book.findById(bookId);
    book.availableCopies += 1;
    await book.save();

    res.json({
      message: 'Book returned successfully',
      borrow,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Borrow history for a user
exports.borrowHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await Borrow.find({ userId })
      .populate('bookId')
      .sort({ borrowedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all active borrows
exports.activeBorrows = async (req, res) => {
  try {
    const active = await Borrow.find({ returnedAt: null })
      .populate('userId')
      .populate('bookId');

    res.json(active);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
