// backend/routes/equipment.js
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/labs', equipmentController.getLabs);
router.get('/instruments/:lab_id', equipmentController.getInstruments);
router.post('/book', authMiddleware, equipmentController.bookSlot);

module.exports = router;