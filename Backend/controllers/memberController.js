const User = require('../models/userModel');
const Borrow = require('../models/borrowModel');

// ─── GET ALL MEMBERS ─────────────────────────────────────────────
exports.getAllMembers = exports.getMembers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = { role: 'member' };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const s = new RegExp(search, 'i');
      query.$or = [
        { name: s },
        { email: s },
        { membershipId: s },
        { phone: s },
      ];
    }

    const members = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: members.map(normalizeMember) });
  } catch (err) {
    next(err);
  }
};

// ─── GET MEMBER BY ID ─────────────────────────────────────────────
exports.getMemberById = async (req, res, next) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, data: normalizeMember(member) });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE MEMBER ───────────────────────────────────────────────
exports.createMember = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const member = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      address: address || '',
      role: 'member',
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Member created',
      data: normalizeMember(member),
    });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE MEMBER ───────────────────────────────────────────────
exports.updateMember = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'address', 'status', 'email'];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const member = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.json({ success: true, message: 'Member updated', data: normalizeMember(member) });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE MEMBER ───────────────────────────────────────────────
exports.deleteMember = async (req, res, next) => {
  try {
    const member = await User.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── SUSPEND MEMBER ──────────────────────────────────────────────
exports.suspendMember = async (req, res, next) => {
  try {
    const member = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, message: 'Member suspended', data: normalizeMember(member) });
  } catch (err) {
    next(err);
  }
};

// ─── ACTIVATE MEMBER ─────────────────────────────────────────────
exports.activateMember = async (req, res, next) => {
  try {
    const member = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, message: 'Member activated', data: normalizeMember(member) });
  } catch (err) {
    next(err);
  }
};

// ─── GET MEMBER STATS ────────────────────────────────────────────
exports.getMemberStats = async (req, res, next) => {
  try {
    const [total, active, suspended, inactive] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ role: 'member', status: 'active' }),
      User.countDocuments({ role: 'member', status: 'suspended' }),
      User.countDocuments({ role: 'member', status: 'inactive' }),
    ]);

    res.json({
      success: true,
      data: { total, active, suspended, inactive },
    });
  } catch (err) {
    next(err);
  }
};

// ─── NORMALIZE HELPER ─────────────────────────────────────────────
function normalizeMember(member) {
  const obj = member.toJSON ? member.toJSON() : member;
  return {
    id: obj.id || obj._id?.toString(),
    name: obj.name,
    email: obj.email,
    phone: obj.phone || '',
    membershipId: obj.membershipId || '',
    joinDate: obj.joinDate || obj.createdAt,
    status: obj.status || 'active',
    borrowedBooks: obj.borrowedBooks || 0,
    address: obj.address || '',
    role: obj.role,
  };
}
