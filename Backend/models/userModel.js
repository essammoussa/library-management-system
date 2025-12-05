const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user should have a name'],
  },
  email: { type: String, unique: true },
  phone: {
    type: String,
    required: true,
  },
  membershipId: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
  },
  borrowedBooks: Number,
  address: String,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('Users', userSchema);

module.exports = User;
