const Book = require('../models/bookModel');
const Borrow = require('../models/borrowModel');
const User = require('../models/userModel');
const Fine = require('../models/fineModel');

const FINE_RATE_PER_DAY = 5; // EGP per day overdue

// ─── GET ALL BORROWS ─────────────────────────────────────────────
exports.getAllBorrows = async (req, res, next) => {
  try {
    const { status, memberId, bookId } = req.query;
    let query = {};

    if (status && status !== 'all') {
      // Update overdue status dynamically before querying
      if (status === 'overdue') {
        await updateOverdueStatus();
      }
      query.status = status;
    }

    if (memberId) query.userId = memberId;
    if (bookId) query.bookId = bookId;

    const records = await Borrow.find(query).sort({ borrowedAt: -1 });
    const normalized = records.map(normalizeBorrow);

    res.json({ success: true, data: normalized });
  } catch (err) {
    next(err);
  }
};

// ─── GET BORROW BY ID ────────────────────────────────────────────
exports.getBorrowById = async (req, res, next) => {
  try {
    const record = await Borrow.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }
    res.json({ success: true, data: normalizeBorrow(record) });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE BORROW (Checkout) ────────────────────────────────────
exports.createBorrow = async (req, res, next) => {
  try {
    const { bookId, memberId, memberName, borrowDate, dueDate } = req.body;

    if (!bookId || !memberId) {
      return res.status(400).json({ success: false, message: 'bookId and memberId are required' });
    }

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'No copies available' });
    }

    // Find member
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Calculate due date: use provided or default 14 days
    const borrowedAt = borrowDate ? new Date(borrowDate) : new Date();
    const due = dueDate
      ? new Date(dueDate)
      : new Date(borrowedAt.getTime() + 14 * 24 * 60 * 60 * 1000);

    const borrow = await Borrow.create({
      bookId,
      bookTitle: book.title,
      userId: memberId,
      memberName: memberName || member.name,
      borrowedAt,
      dueDate: due,
      status: 'active',
    });

    // Decrement available copies
    book.availableCopies -= 1;
    if (book.availableCopies === 0) book.status = 'borrowed';
    await book.save();

    // Increment member's borrowedBooks count
    await User.findByIdAndUpdate(memberId, { $inc: { borrowedBooks: 1 } });

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: normalizeBorrow(borrow),
    });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE BORROW ───────────────────────────────────────────────
exports.updateBorrow = async (req, res, next) => {
  try {
    const allowedFields = ['dueDate', 'status', 'fine'];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const record = await Borrow.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    res.json({ success: true, message: 'Borrow record updated', data: normalizeBorrow(record) });
  } catch (err) {
    next(err);
  }
};

// ─── RETURN BOOK ─────────────────────────────────────────────────
exports.returnBook = async (req, res, next) => {
  try {
    const { returnDate } = req.body;

    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    if (borrow.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Book already returned' });
    }

    const now = returnDate ? new Date(returnDate) : new Date();
    borrow.returnedAt = now;
    borrow.status = 'returned';

    // Calculate fine
    let fineAmount = 0;
    if (now > borrow.dueDate) {
      const daysLate = Math.ceil((now - borrow.dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysLate * FINE_RATE_PER_DAY;
    }
    borrow.fine = fineAmount;
    await borrow.save();

    // Restore book copy
    const book = await Book.findById(borrow.bookId);
    if (book) {
      book.availableCopies += 1;
      if (book.availableCopies > 0) book.status = 'available';
      await book.save();
    }

    // Decrement member's borrowedBooks
    await User.findByIdAndUpdate(borrow.userId, { $inc: { borrowedBooks: -1 } });

    // Auto-create fine record if overdue
    if (fineAmount > 0) {
      const member = await User.findById(borrow.userId);
      await Fine.create({
        userId: borrow.userId,
        borrowId: borrow._id,
        bookId: borrow.bookId,
        memberName: borrow.memberName || (member ? member.name : ''),
        memberEmail: member ? member.email : '',
        bookTitle: borrow.bookTitle,
        borrowDate: borrow.borrowedAt,
        dueDate: borrow.dueDate,
        returnDate: now,
        daysOverdue: Math.ceil((now - borrow.dueDate) / (1000 * 60 * 60 * 24)),
        fineAmount,
        status: 'pending',
      });
    }

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: normalizeBorrow(borrow),
    });
  } catch (err) {
    next(err);
  }
};

// ─── RENEW BORROW ────────────────────────────────────────────────
exports.renewBorrow = async (req, res, next) => {
  try {
    const { newDueDate } = req.body;

    if (!newDueDate) {
      return res.status(400).json({ success: false, message: 'newDueDate is required' });
    }

    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    if (borrow.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Only active borrows can be renewed' });
    }

    borrow.dueDate = new Date(newDueDate);
    await borrow.save();

    res.json({
      success: true,
      message: 'Borrow renewed',
      data: normalizeBorrow(borrow),
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE BORROW ───────────────────────────────────────────────
exports.deleteBorrow = async (req, res, next) => {
  try {
    const record = await Borrow.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }
    res.json({ success: true, message: 'Borrow record deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── GET STATS ───────────────────────────────────────────────────
exports.getBorrowStats = async (req, res, next) => {
  try {
    await updateOverdueStatus();

    const [total, active, overdue, returned] = await Promise.all([
      Borrow.countDocuments(),
      Borrow.countDocuments({ status: 'active' }),
      Borrow.countDocuments({ status: 'overdue' }),
      Borrow.countDocuments({ status: 'returned' }),
    ]);

    res.json({ success: true, data: { total, active, overdue, returned } });
  } catch (err) {
    next(err);
  }
};

// ─── INTERNAL: Update overdue status ────────────────────────────
async function updateOverdueStatus() {
  const now = new Date();
  await Borrow.updateMany(
    { status: 'active', dueDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );
}

// ─── NORMALIZE HELPER ─────────────────────────────────────────────
function normalizeBorrow(record) {
  const obj = record.toJSON ? record.toJSON() : record;
  return {
    id: obj.id || obj._id?.toString(),
    bookId: obj.bookId?.toString(),
    bookTitle: obj.bookTitle,
    memberId: obj.userId?.toString(),
    memberName: obj.memberName || '',
    borrowDate: obj.borrowedAt,
    dueDate: obj.dueDate,
    returnDate: obj.returnedAt || null,
    status: obj.status,
    fine: obj.fine || 0,
  };
}
