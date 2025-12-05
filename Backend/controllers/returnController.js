const Book = require('../models/bookModel.js');
const Borrow = require('../models/borrowModel.js');
const { createFine } = require('./finesController.js');
// Return a borrowed book
exports.returnBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId } = req.body;

    // Validate
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
        message:
          'This user has not borrowed this book or has already returned it',
      });
    }

    // Mark as returned
    const now = new Date();
    borrow.returnedAt = now;

    // Fine calculation
    let fine = 0;
    const due = borrow.dueDate;
    if (now > due) {
      const daysLate = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      fine = daysLate * 5; // Example: 5 EGP per day
    }
    if (fine > 0) {
      await createFine(userId, borrow._id, fine);
    }

    borrow.fineAmount = fine;
    await borrow.save();

    // Update book copies
    const book = await Book.findById(bookId);
    book.availableCopies += 1;
    await book.save();

    res.json({
      message: 'Book returned successfully',
      book: book.title,
      returnedAt: borrow.returnedAt,
      dueDate: borrow.dueDate,
      fineAmount: borrow.fineAmount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all returns for a user
exports.userReturnHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await Borrow.find({
      userId,
      returnedAt: { $ne: null },
    })
      .populate('bookId')
      .sort({ returnedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
