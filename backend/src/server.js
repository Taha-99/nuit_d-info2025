const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const createTables = require('./config/initDb');

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const syncRoutes = require('./routes/syncRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');

createTables();

const app = express();
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(helmet());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/knowledge-base', knowledgeRoutes);

const port = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`API running on port ${port}`));
}

module.exports = app;
