const bcrypt = require('bcryptjs');
const db = require('../config/database');

const findByEmail = (email) => db.prepare('SELECT * FROM users WHERE email = ?').get(email);

const createAdmin = ({ email, password, role = 'admin' }) => {
  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)').run(email, hashed, role);
};

module.exports = { findByEmail, createAdmin };
