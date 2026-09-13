const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'books',
      required: [true, 'bookId is required'],
    },
    bookTitle: {
      type: String,
      required: [true, 'bookTitle is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: [true, 'userId is required'],
    },
    memberName: {
      type: String,
      default: '',
    },
    borrowedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'returned', 'overdue'],
      default: 'active',
    },
    fine: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        // Map fields to match frontend BorrowRecord interface
        ret.memberId = ret.userId ? ret.userId.toString() : ret.userId;
        ret.borrowDate = ret.borrowedAt;
        ret.returnDate = ret.returnedAt;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Borrow = mongoose.model('Borrow', borrowSchema);

module.exports = Borrow;
