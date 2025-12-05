const multer = require('multer');
const path = require('path');

// Where to store images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/book-covers');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Allow only images
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files allowed'), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
