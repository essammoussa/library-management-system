const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'books',
      required: [true, 'bookId is required'],
    },
    bookTitle: {
      type: String,
      default: '',
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
    memberEmail: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    reservationDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: function () {
        const d = new Date();
        d.setDate(d.getDate() + 7); // 7 days from now
        return d;
      },
    },
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'expired', 'cancelled'],
      default: 'active',
    },
    priority: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.memberId = ret.userId ? ret.userId.toString() : ret.userId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;