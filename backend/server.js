// backend/server.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const equipmentRoutes = require('./routes/equipment');
const reimbursementRoutes = require('./routes/reimbursement');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Add a root route
app.get('/', (req, res) => {
  res.json({ message: 'DMSE Equipment Booking API is running. Use /api/ endpoints.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/reimbursement', reimbursementRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));