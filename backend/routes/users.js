const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware(['user', 'admin']), userController.getUsers);

module.exports = router;