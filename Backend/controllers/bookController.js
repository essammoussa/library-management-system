const Book = require('../models/bookModel');

exports.getBook = async (req, res) => {
  try {
    const { search, category, available } = req.query;

    let query = {};

    // SEARCH
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') },
        { isbn: new RegExp(search, 'i') },
      ];
    }

    // FILTER by category
    if (category) {
      query.category = category;
    }

    // FILTER by availability
    if (available === 'true') {
      query.availableCopies = { $gt: 0 };
    } else if (available === 'false') {
      query.availableCopies = 0;
    }

    const books = await Book.find(query);

    res.status(200).json({
      status: 'success',
      data: {
        books: books,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getBooks = async (req, res) => {
  try {
    const booksData = await Book.find();
    res.status(200).json({
      status: 'success',
      data: {
        books: booksData,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      data: {
        message: 'Not a valid book',
      },
    });
  }
};

exports.addBook = async (req, res) => {
  try {
    const newBook = await Book.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        message: 'new book is added',
        book: newBook,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      data: {
        message: err,
      },
    });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const newBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidator: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Book is updated',
        book: newBook,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      data: {
        message: err,
      },
    });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const newBook = await Book.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: {
        message: 'Book is deleted',
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      data: {
        message: 'Not a valid book',
      },
    });
  }
};
