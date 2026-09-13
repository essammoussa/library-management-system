const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// ─── Generate JWT ────────────────────────────────────────────────
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ─── REGISTER ────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Determine role — only superadmin@library.com gets admin role on register
    const role = email.toLowerCase() === 'superadmin@library.com' ? 'admin' : 'member';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      address: address || '',
      role,
    });

    const token = createToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        membershipId: user.membershipId,
        phone: user.phone,
        address: user.address,
        joinDate: user.joinDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ───────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Must explicitly select password since it's select: false
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if account is active
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }
    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is inactive' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        membershipId: user.membershipId,
        phone: user.phone,
        address: user.address,
        borrowedBooks: user.borrowedBooks,
        joinDate: user.joinDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET PROFILE ─────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE PROFILE ──────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'phone', 'address'];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Allow password change with verification
    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password' });
      }
      const user = await User.findById(req.user.id).select('+password');
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      updates.password = req.body.newPassword;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) {
    next(err);
  }
};