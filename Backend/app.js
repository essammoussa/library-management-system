const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/authRoutes');
const bookRouter = require('./routes/bookRouter');
const borrowRouter = require('./routes/borrowRouter.js');
const returnRouter = require('./routes/returnRouter.js');
const finesRouter = require('./routes/fineRouter.js');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// Routes
app.use('/api/auth', authRouter);

app.use('/api/v1/books', bookRouter);
app.use('/api/v1/borrow', borrowRouter);
app.use('/api/v1/return', returnRouter);
app.use('/api/', finesRouter);
module.exports = app;
