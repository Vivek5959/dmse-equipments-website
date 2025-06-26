// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = (req, res) => {
  const { username, password, privilege_level } = req.body;
  if (!username || !password || !privilege_level) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    db.run(
      `INSERT INTO users (username, userpassword, privilege_level) VALUES (?, ?, ?)`,
      [username, hashedPassword, privilege_level],
      function (err) {
        if (err) return res.status(500).json({ error: 'Registration failed: ' + err.message });
        res.status(201).json({ message: 'User registered', userId: this.lastID });
      }
    );
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    bcrypt.compare(password, user.userpassword, (err, isMatch) => {
      if (err || !isMatch) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign(
        { id: user.id, privilege_level: user.privilege_level },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token, user: { id: user.id, username, privilege_level: user.privilege_level } });
    });
  });
};