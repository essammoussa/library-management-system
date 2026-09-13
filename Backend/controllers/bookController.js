const Book = require('../models/bookModel');

// ─── GET ALL BOOKS (with search/filter) ──────────────────────────
exports.getBooks = async (req, res, next) => {
  try {
    const { search, category, available, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') },
        { isbn: new RegExp(search, 'i') },
      ];
    }

    if (category && category !== 'all') {
      query.category = { $in: [category] };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (available === 'true') {
      query.availableCopies = { $gt: 0 };
    } else if (available === 'false') {
      query.availableCopies = 0;
    }

    const books = await Book.find(query).sort({ createdAt: -1 });

    // Normalize to match frontend Book interface
    const normalized = books.map((b) => normalizeBook(b));

    res.status(200).json({
      success: true,
      data: normalized,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET SINGLE BOOK ─────────────────────────────────────────────
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, data: normalizeBook(book) });
  } catch (err) {
    next(err);
  }
};

// ─── GET CATEGORIES ──────────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Book.distinct('category');
    res.status(200).json({ success: true, data: categories.flat() });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE BOOK ─────────────────────────────────────────────────
exports.addBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category, publishYear, quantity, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // Handle category: can be string or array
    let cats = category;
    if (typeof category === 'string') {
      cats = [category];
    }

    const qty = parseInt(quantity) || 1;

    const coverUrl = req.file ? `/uploads/book-covers/${req.file.filename}` : '';

    const newBook = await Book.create({
      title,
      author: author || 'Unknown',
      isbn: isbn || '',
      category: cats || ['General'],
      publishYear: publishYear ? parseInt(publishYear) : undefined,
      quantity: qty,
      availableCopies: qty,
      coverUrl,
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: normalizeBook(newBook),
    });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE BOOK ─────────────────────────────────────────────────
exports.updateBook = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (typeof updateData.category === 'string') {
      updateData.category = [updateData.category];
    }

    if (req.file) {
      updateData.coverUrl = `/uploads/book-covers/${req.file.filename}`;
    }

    if (updateData.quantity !== undefined) {
      updateData.quantity = parseInt(updateData.quantity);
    }

    const book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Book updated',
      data: normalizeBook(book),
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE BOOK ─────────────────────────────────────────────────
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, message: 'Book deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── NORMALIZE HELPER ─────────────────────────────────────────────
// Maps backend book to match frontend Book interface
function normalizeBook(book) {
  const obj = book.toJSON ? book.toJSON() : book;
  return {
    id: obj.id || obj._id?.toString(),
    title: obj.title,
    author: obj.author,
    isbn: obj.isbn,
    category: Array.isArray(obj.category) ? obj.category[0] : obj.category, // frontend expects string
    status: obj.status || 'available',
    publishYear: obj.publishYear,
    quantity: obj.quantity || 1,
    availableQuantity: obj.availableCopies,
    image: obj.coverUrl || '',
    description: obj.description,
  };
}
