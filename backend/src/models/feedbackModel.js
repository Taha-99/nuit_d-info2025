const db = require('../config/database');

const insertFeedback = ({ rating, comment, suggestion }) => {
  const stmt = db.prepare('INSERT INTO feedback (rating, comment, suggestion, createdAt) VALUES (?, ?, ?, ?)');
  const info = stmt.run(rating, comment, suggestion, Date.now());
  return { id: info.lastInsertRowid, rating, comment, suggestion };
};

const listFeedback = () => db.prepare('SELECT * FROM feedback ORDER BY createdAt DESC').all();

module.exports = { insertFeedback, listFeedback };
