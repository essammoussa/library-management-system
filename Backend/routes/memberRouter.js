const express = require('express');
const memberController = require('../controllers/memberController');
const { protect, adminOnly } = require('../Middlewares/myMiddleWares/authMiddleware');

const router = express.Router();

// Stats
router.get('/stats', protect, adminOnly, memberController.getMemberStats);

// CRUD
router.get('/', protect, adminOnly, memberController.getAllMembers);
router.post('/', protect, adminOnly, memberController.createMember);
router.get('/:id', protect, memberController.getMemberById);
router.put('/:id', protect, adminOnly, memberController.updateMember);
router.delete('/:id', protect, adminOnly, memberController.deleteMember);

// Special actions
router.post('/:id/suspend', protect, adminOnly, memberController.suspendMember);
router.post('/:id/activate', protect, adminOnly, memberController.activateMember);

module.exports = router;
