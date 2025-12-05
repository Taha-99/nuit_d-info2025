const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Service = require('../models/serviceModel');

const initializeDatabase = async () => {
  try {
    // Create default admin user if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@nird.gov';
      const adminPassword = process.env.ADMIN_PASSWORD || 'password';
      
      // Don't hash here - the userModel pre('save') hook will hash it
      await User.create({
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        name: 'System Administrator',
        isActive: true
      });
      
      console.log(`Default admin user created: ${adminEmail}`);
    }

    // Seed services if none exist
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      const seedServices = [
        {
          id: 'svc_birth_certificate',
          title: 'Acte de naissance',
          description: 'Demande ou retrait d\'un acte de naissance officiel.',
          category: 'documents',
          steps: [
            { order: 1, title: 'Préparer les pièces', description: 'Carte d\'identité + livret de famille.' },
            { order: 2, title: 'Se rendre à la mairie', description: 'Déposer la demande au guichet.' },
            { order: 3, title: 'Retirer le document', description: 'Revenir avec le récépissé.' }
          ],
          forms: [
            { name: 'Formulaire CERFA', url: 'https://example.gov/forms/birth.pdf' }
          ],
          faq: [
            { id: 'delais', question: 'Quels délais ?', answer: '24 à 72 heures selon la commune.' }
          ],
          contact: { phone: '+213-555-123456', email: 'etatcivil@example.gov' }
        },
        {
          id: 'svc_passport',
          title: 'Passeport biométrique',
          description: 'Démarches pour obtenir un passeport biométrique.',
          category: 'documents',
          steps: [
            { order: 1, title: 'Prendre rendez-vous', description: 'Via la plateforme officielle.' },
            { order: 2, title: 'Déposer le dossier', description: 'Présenter les pièces et photos.' },
            { order: 3, title: 'Suivre la production', description: 'Recevoir une notification SMS.' }
          ],
          forms: [
            { name: 'Formulaire de demande', url: 'https://example.gov/forms/passport.pdf' }
          ],
          faq: [
            { id: 'cout', question: 'Combien ça coûte ?', answer: '10 000 DA pour un adulte.' }
          ],
          contact: { phone: '+213-555-654321', email: 'passeport@example.gov' }
        }
      ];

      await Service.insertMany(seedServices);
      console.log('Default services seeded successfully');
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = initializeDatabase;
