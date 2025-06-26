// backend/controllers/reimbursementController.js
const db = require('../config/db');

exports.requestReimbursement = (req, res) => {
  const { course_id, detail, current_desk, requested_by } = req.body;
  db.run(
    `INSERT INTO reimbursements (course_id, detail, current_desk, requested_by, is_resolved) 
     VALUES (?, ?, ?, ?, ?)`,
    [course_id, detail, current_desk, requested_by, 0],
    function (err) {
      if (err) return res.status(500).json({ error: 'Request failed: ' + err.message });
      res.status(201).json({ message: 'Reimbursement requested', requestId: this.lastID });
    }
  );
};

exports.getReimbursements = (req, res) => {
  const { user_id } = req.params;
  db.all(`SELECT * FROM reimbursements WHERE requested_by = ?`, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch reimbursements: ' + err.message });
    res.json(rows);
  });
};