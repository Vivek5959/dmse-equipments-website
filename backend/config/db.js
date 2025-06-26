// backend/config/db.js
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
    throw err;
  }
  console.log('Connected to SQLite database');
});

module.exports = db;