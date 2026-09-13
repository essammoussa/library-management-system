const Fine = require('../models/fineModel');

// ─── GET ALL FINES ─────────────────────────────────────────────
exports.getAllFines = async (req, res, next) => {
  try {
    const { status, memberId } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (memberId) query.userId = memberId;

    const fines = await Fine.find(query)
      .populate('userId', 'name email')
      .populate('borrowId', 'borrowedAt dueDate')
      .sort({ createdAt: -1 });

    const normalized = fines.map(normalizeFine);
    res.json({ success: true, data: normalized });
  } catch (err) {
    next(err);
  }
};

// ─── GET FINE BY ID ────────────────────────────────────────────
exports.getFineById = async (req, res, next) => {
  try {
    const fine = await Fine.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('borrowId');
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found' });
    }
    res.json({ success: true, data: normalizeFine(fine) });
  } catch (err) {
    next(err);
  }
};

// ─── GET FINES BY MEMBER ───────────────────────────────────────
exports.getFinesByMember = async (req, res, next) => {
  try {
    const fines = await Fine.find({ userId: req.params.memberId })
      .populate('borrowId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: fines.map(normalizeFine) });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE FINE ───────────────────────────────────────────────
exports.createFine = async (req, res, next) => {
  try {
    const User = require('../models/userModel');
    const Borrow = require('../models/borrowModel');

    const data = { ...req.body };
    const memberId = data.memberId || data.userId;
    if (memberId) {
      data.userId = memberId;
      if (!data.memberName || !data.memberEmail) {
        const user = await User.findById(memberId);
        if (user) {
          data.memberName = data.memberName || user.name;
          data.memberEmail = data.memberEmail || user.email;
        }
      }
    }

    if (data.borrowId && !data.bookTitle) {
      const borrow = await Borrow.findById(data.borrowId);
      if (borrow) {
        data.bookTitle = borrow.bookTitle;
        data.bookId = data.bookId || borrow.bookId;
      }
    }

    const fine = await Fine.create(data);
    res.status(201).json({ success: true, data: normalizeFine(fine) });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE FINE ───────────────────────────────────────────────
exports.updateFine = async (req, res, next) => {
  try {
    const fine = await Fine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found' });
    }
    res.json({ success: true, data: normalizeFine(fine) });
  } catch (err) {
    next(err);
  }
};

// ─── MARK AS PAID ──────────────────────────────────────────────
exports.markAsPaid = async (req, res, next) => {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found' });
    }
    if (fine.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Fine already paid' });
    }

    fine.status = 'paid';
    fine.isPaid = true;
    fine.paidAt = new Date();
    if (req.body.notes) fine.notes = req.body.notes;
    await fine.save();

    res.json({ success: true, message: 'Fine marked as paid', data: normalizeFine(fine) });
  } catch (err) {
    next(err);
  }
};

// ─── WAIVE FINE ────────────────────────────────────────────────
exports.waiveFine = async (req, res, next) => {
  try {
    const { reason, waivedBy } = req.body;
    const fine = await Fine.findById(req.params.id);
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found' });
    }

    fine.status = 'waived';
    fine.waivedAt = new Date();
    fine.waivedBy = waivedBy || 'admin';
    fine.waiverReason = reason || '';
    await fine.save();

    res.json({ success: true, message: 'Fine waived', data: normalizeFine(fine) });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE FINE ───────────────────────────────────────────────
exports.deleteFine = async (req, res, next) => {
  try {
    const fine = await Fine.findByIdAndDelete(req.params.id);
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found' });
    }
    res.json({ success: true, message: 'Fine deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── BULK DELETE ───────────────────────────────────────────────
exports.bulkDeleteFines = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'ids array required' });
    }
    const result = await Fine.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
};

// ─── NORMALIZE ─────────────────────────────────────────────────
function normalizeFine(fine) {
  const obj = fine.toJSON ? fine.toJSON() : fine;
  return {
    id: obj.id || obj._id?.toString(),
    memberId: obj.userId?._id?.toString() || obj.userId?.toString(),
    memberName: obj.userId?.name || obj.memberName || '',
    memberEmail: obj.userId?.email || obj.memberEmail || '',
    bookId: obj.bookId?.toString(),
    bookTitle: obj.bookTitle || '',
    borrowId: obj.borrowId?._id?.toString() || obj.borrowId?.toString(),
    borrowDate: obj.borrowDate,
    dueDate: obj.dueDate,
    returnDate: obj.returnDate,
    daysOverdue: obj.daysOverdue || 0,
    fineAmount: obj.fineAmount || obj.amount || 0,
    amount: obj.fineAmount || obj.amount || 0,
    status: obj.status || (obj.isPaid ? 'paid' : 'pending'),
    isPaid: obj.isPaid || obj.status === 'paid',
    paidAt: obj.paidAt,
    waivedAt: obj.waivedAt,
    waivedBy: obj.waivedBy,
    waiverReason: obj.waiverReason,
    notes: obj.notes,
    createdAt: obj.createdAt,
  };
}
