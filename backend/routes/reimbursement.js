// backend/routes/reimbursement.js
const express = require('express');
const router = express.Router();
const reimbursementController = require('../controllers/reimbursementController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/request', authMiddleware, reimbursementController.requestReimbursement);
router.get('/:user_id', authMiddleware, reimbursementController.getReimbursements);

module.exports = router;