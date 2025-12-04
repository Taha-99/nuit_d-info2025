const db = require('../config/database');

const parse = (row) => ({
  ...row,
  steps: row.steps ? JSON.parse(row.steps) : [],
  forms: row.forms ? JSON.parse(row.forms) : [],
  faq: row.faq ? JSON.parse(row.faq) : [],
  contact: row.contact ? JSON.parse(row.contact) : {},
});

const getAll = () => db.prepare('SELECT * FROM services').all().map(parse);

const getById = (id) => {
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  return row ? parse(row) : null;
};

const upsert = (service) => {
  db.prepare(`INSERT INTO services (id, title, description, category, steps, forms, faq, contact)
    VALUES (@id, @title, @description, @category, @steps, @forms, @faq, @contact)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title,
      description=excluded.description,
      category=excluded.category,
      steps=excluded.steps,
      forms=excluded.forms,
      faq=excluded.faq,
      contact=excluded.contact`).run({
    ...service,
    steps: JSON.stringify(service.steps || []),
    forms: JSON.stringify(service.forms || []),
    faq: JSON.stringify(service.faq || []),
    contact: JSON.stringify(service.contact || {}),
  });
  return getById(service.id);
};

module.exports = { getAll, getById, upsert };
