const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A book should have a title'],
  },
  author: String,
  isbn: String,
  category: {
    type: [String],
    required: [true, 'A book should have a category'],
  },
  status: {
    type: String,
    enum: ['pending', 'available', 'borrowed', 'reserved'],
  },
  publishYear: Number,
  availableCopies: Number,
  coverUrl: String,
});

const Book = mongoose.model('books', bookSchema);

module.exports = Book;
