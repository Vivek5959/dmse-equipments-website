const db = require('../config/db');

exports.getUsers = (req, res) => {
  db.all(`SELECT id, username FROM users`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch users: ' + err.message });
    res.json(rows);
  });
};