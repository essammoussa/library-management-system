const Fine = require('../models/fineModel.js');

// Auto-create a fine (used by Return System)
exports.createFine = async (userId, borrowId, amount) => {
  if (amount <= 0) return null;

  const fine = new Fine({
    userId,
    borrowId,
    amount,
  });

  await fine.save();
  return fine;
};

// Get all unpaid fines for a user
exports.getUnpaidFines = async (req, res) => {
  try {
    const { userId } = req.params;

    const fines = await Fine.find({
      userId,
      isPaid: false,
    }).populate('borrowId');

    res.json(fines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pay fine
exports.payFine = async (req, res) => {
  try {
    const { fineId } = req.params;

    const fine = await Fine.findById(fineId);
    if (!fine) return res.status(404).json({ message: 'Fine not found' });

    if (fine.isPaid)
      return res.status(400).json({ message: 'Fine already paid' });

    fine.isPaid = true;
    fine.paidAt = new Date();
    await fine.save();

    res.json({
      message: 'Fine paid successfully',
      fine,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: get all fines
exports.getAllFines = async (req, res) => {
  try {
    const fines = await Fine.find().populate('userId').populate('borrowId');

    res.json(fines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
