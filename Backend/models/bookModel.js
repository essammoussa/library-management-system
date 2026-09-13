const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A book should have a title'],
      trim: true,
    },
    author: {
      type: String,
      default: 'Unknown',
    },
    isbn: {
      type: String,
      default: '',
    },
    category: {
      type: [String],
      required: [true, 'A book should have a category'],
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'borrowed', 'reserved', 'unavailable', 'maintenance', 'lost'],
      default: 'available',
    },
    publishYear: {
      type: Number,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    availableCopies: {
      type: Number,
      default: 1,
      min: 0,
    },
    coverUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Text index for search
bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

const Book = mongoose.model('books', bookSchema);

module.exports = Book;
