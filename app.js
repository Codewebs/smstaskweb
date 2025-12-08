const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const smsRoutes = require('./routes/sms');
const statsRoutes = require('./routes/stats');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Auth très simple via header Authorization: Bearer <token>
app.use((req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token !== process.env.AUTH_TOKEN) {
    console.log('error connexion')
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.use('/sms', smsRoutes);
app.use('/stats', statsRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on :${port}`));
