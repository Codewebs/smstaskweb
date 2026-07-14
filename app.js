require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');


const smsRoutes = require('./routes/sms');
const statsRoutes = require('./routes/stats');
const contactRoutes = require('./routes/contacts');
const groupeRoutes = require('./routes/groupes');
const campagneRoutes = require('./routes/campagnes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Endpoint public pour le monitoring (UptimeRobot, etc.)
// Doit être placé AVANT le middleware d'authentification
app.get('/ping', (req, res) => {
  res.json({
    status: 'pong',
    timestamp: Date.now(),
    service: 'SmsTask API',
    uptime: process.uptime()
  });
});

// Auth très simple via header Authorization: Bearer <token>
app.use((req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token !== process.env.AUTH_TOKEN) {
    console.log('error ------------------')
    console.log(token)
    console.log(process.env.AUTH_TOKEN)
    console.log('error connexion')
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.use('/sms', smsRoutes);
app.use('/stats', statsRoutes);
app.use('/contacts', contactRoutes);
app.use('/groupes', groupeRoutes);
app.use('/campagnes', campagneRoutes);

// Nettoyage automatique quotidien
const { Contact } = require('./models');
setInterval(async () => {
  try {
    const [results] = await Contact.sequelize.query(`
      DELETE FROM contacts
      WHERE isEphemeral = true
      AND idContact NOT IN (SELECT idContact FROM campagne_destinataires)
    `);
    if (results.affectedRows > 0) console.log(`[Cleanup] ${results.affectedRows} éphémères supprimés.`);
  } catch (e) {
    console.error('[Cleanup Error]', e);
  }
}, 24 * 60 * 60 * 1000);

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {  // ← Ajouter '0.0.0.0'
    console.log(`API running on http://0.0.0.0:${port}`);
});
