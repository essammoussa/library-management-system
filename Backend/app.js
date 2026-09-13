const express = require('express');
const cors = require('cors');
const path = require('path');

const authRouter = require('./routes/authRoutes');
const bookRouter = require('./routes/bookRouter');
const borrowRouter = require('./routes/borrowRouter');
const finesRouter = require('./routes/fineRouter');
const memberRouter = require('./routes/memberRouter');
const reservationRouter = require('./routes/reservationRouter');
const dashboardRouter = require('./routes/dashboardRouter');
const reportRouter = require('./routes/reportRouter');

const errorHandler = require('./Middlewares/myMiddleWares/errorHandler');

const app = express();

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:8080'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/borrows', borrowRouter);
app.use('/api/v1/fines', finesRouter);
app.use('/api/v1/members', memberRouter);
app.use('/api/v1/reservations', reservationRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/reports', reportRouter);

// ─── Health check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Library API is running' });
});

// ─── 404 handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ─── Global error handler (must be last) ────────────────────────
app.use(errorHandler);

module.exports = app;
