const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borrow',
    required: true,
  },
  memberName: {
    type: String,
    required: true,
  },
  memberEmail: {
    type: String,
    required: true,
  },
  bookTitle: {
    type: String,
  },
  borrowDate: { type: Date, default: Date.now },
  dueDate: Date,
  returnDate: Date,
  daysOverdue: Number,
  fineAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['paid', 'pending', 'waived', 'overdue'],
  },
  createdAt: { type: Date },
});

const Fine = mongoose.model('Fine', fineSchema);
module.exports = Fine;
