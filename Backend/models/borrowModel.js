const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  bookTitle: { type: String, required: true },
  borrowedAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
  returnedAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue'],
  },
  fine: {
    type: Number,
    default: 0,
  },
});

exports = mongoose.model('Borrow', borrowSchema);
