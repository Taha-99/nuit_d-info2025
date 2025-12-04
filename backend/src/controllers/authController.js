const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findByEmail, createAdmin } = require('../models/userModel');

const ensureAdmin = () => {
  if (!findByEmail(process.env.ADMIN_EMAIL)) {
    createAdmin({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  }
};

const login = (req, res) => {
  ensureAdmin();
  const { email, password } = req.body;
  const user = findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
};

module.exports = { login };
