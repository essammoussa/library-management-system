const express = require('express');
const router = express.Router();

const upload = require('../Middlewares/myMiddleWares/uploadMiddleWare');
const {
  protect,
  adminOnly,
} = require('../Middlewares/myMiddleWares/authMiddleware');

const {
  addBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');

// Admin only: Add book + update + delete
router.post('/', protect, adminOnly, upload.single('cover'), addBook);
router.put('/:id', protect, adminOnly, upload.single('cover'), updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

// Public: Get books
router.get('/', getBooks);
router.get('/:id', getBook);

module.exports = router;
