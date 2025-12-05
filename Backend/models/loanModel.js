const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const borrowSchema = mongoose.Schema({
  bookId: {
    type: ObjectId,
    required: [true, 'A book ID is needed'],
  },
  userId: {
    type: ObjectId,
    required: [true, 'A user ID is needed'],
  },
  borrowDate: {
    type: Date,
    required: [true, 'A borrow time is needed'],
    default: Date.now(),
  },
  dueDate: Date,
  returnDate: Date,
  fineAmount: Number,
});

const Borrow = mongoose.model('borrow', borrowSchema);

module.exports = Borrow;
