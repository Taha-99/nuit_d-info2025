const db = require('./database');

const createTables = () => {
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      steps TEXT,
      forms TEXT,
      faq TEXT,
      contact TEXT
    )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rating INTEGER,
      comment TEXT,
      suggestion TEXT,
      createdAt INTEGER
    )`).run();

  const { count } = db.prepare('SELECT COUNT(*) as count FROM services').get();
  if (count === 0) {
    const insert = db.prepare(`INSERT INTO services (id, title, description, category, steps, forms, faq, contact)
      VALUES (@id, @title, @description, @category, @steps, @forms, @faq, @contact)`);
    const seedData = [
      {
        id: 'svc_birth_certificate',
        title: 'Acte de naissance',
        description: 'Demande ou retrait d\'un acte de naissance officiel.',
        category: 'documents',
        steps: JSON.stringify([
          { order: 1, title: 'Préparer les pièces', description: 'Carte d\'identité + livret de famille.' },
          { order: 2, title: 'Se rendre à la mairie', description: 'Déposer la demande au guichet.' },
          { order: 3, title: 'Retirer le document', description: 'Revenir avec le récépissé.' }
        ]),
        forms: JSON.stringify([
          { name: 'Formulaire CERFA', url: 'https://example.gov/forms/birth.pdf' }
        ]),
        faq: JSON.stringify([
          { id: 'delais', question: 'Quels délais ?', answer: '24 à 72 heures selon la commune.' }
        ]),
        contact: JSON.stringify({ phone: '+213-555-123456', email: 'etatcivil@example.gov' })
      },
      {
        id: 'svc_passport',
        title: 'Passeport biométrique',
        description: 'Démarches pour obtenir un passeport biométrique.',
        category: 'documents',
        steps: JSON.stringify([
          { order: 1, title: 'Prendre rendez-vous', description: 'Via la plateforme officielle.' },
          { order: 2, title: 'Déposer le dossier', description: 'Présenter les pièces et photos.' },
          { order: 3, title: 'Suivre la production', description: 'Recevoir une notification SMS.' }
        ]),
        forms: JSON.stringify([
          { name: 'Formulaire de demande', url: 'https://example.gov/forms/passport.pdf' }
        ]),
        faq: JSON.stringify([
          { id: 'cout', question: 'Combien ça coûte ?', answer: '10 000 DA pour un adulte.' }
        ]),
        contact: JSON.stringify({ phone: '+213-555-654321', email: 'passeport@example.gov' })
      }
    ];
    seedData.forEach((row) => insert.run(row));
  }
};

module.exports = createTables;
