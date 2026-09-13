const express = require('express');
const router = express.Router();

const upload = require('../Middlewares/myMiddleWares/uploadMiddleWare');
const { protect, adminOnly } = require('../Middlewares/myMiddleWares/authMiddleware');

const {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getCategories,
} = require('../controllers/bookController');

// Categories (before /:id to avoid conflict)
router.get('/categories', getCategories);

// Public: Get books
router.get('/', getBooks);
router.get('/:id', getBookById);

// Admin only: Add book + update + delete
router.post('/', protect, adminOnly, upload.single('cover'), addBook);
router.put('/:id', protect, adminOnly, upload.single('cover'), updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
