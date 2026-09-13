const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    borrowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Borrow',
      required: false,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'books',
    },
    memberName: {
      type: String,
      default: '',
    },
    memberEmail: {
      type: String,
      default: '',
    },
    bookTitle: {
      type: String,
      default: '',
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    returnDate: {
      type: Date,
    },
    daysOverdue: {
      type: Number,
      default: 0,
    },
    fineAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'waived', 'overdue'],
      default: 'pending',
    },
    // Payment info
    paidAt: {
      type: Date,
    },
    // Waiver info
    waivedAt: {
      type: Date,
    },
    waivedBy: {
      type: String,
    },
    waiverReason: {
      type: String,
    },
    // General notes
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.memberId = ret.userId ? ret.userId.toString() : ret.userId;
        ret.createdAt = ret.createdAt || ret._id.getTimestamp();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Fine = mongoose.model('Fine', fineSchema);

module.exports = Fine;
