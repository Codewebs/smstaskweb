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
    service: 'Bulk SMS Sender Pro API',
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
const { Contact, Campagne, CampagneVague, CampagneDestinataire, Sms, Sequelize } = require('./models');
const { Op } = Sequelize;

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

// --- SCHEDULER DE CAMPAGNES ---
// Vérifie toutes les minutes s'il y a des vagues à envoyer
/*
setInterval(async () => {
  try {
    const now = new Date();
    // Ajustement pour le fuseau horaire local si nécessaire
    // const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const nowDate = now.toISOString().split('T')[0];
    const nowTime = now.toTimeString().split(' ')[0];

    console.log(`[Scheduler] Check à ${nowDate} ${nowTime}...`);

    // 1. Trouver les vagues EN_ATTENTE ou PROGRAMMÉ dont l'heure est passée
    const vagues = await CampagneVague.findAll({
      where: {
        statut: { [Op.in]: ['EN_ATTENTE', 'PROGRAMMÉ'] },
        [Op.or]: [
          { datePrevue: { [Op.lt]: nowDate } },
          {
            [Op.and]: [
              { datePrevue: nowDate },
              { heurePrevue: { [Op.lte]: nowTime } }
            ]
          }
        ]
      },
      include: [{ model: Campagne }]
    });

    if (vagues.length > 0) {
        console.log(`[Scheduler] ${vagues.length} vague(s) due(s) trouvée(s).`);
    }

    for (const vague of vagues) {
      console.log(`[Scheduler] Traitement vague ${vague.idVague} pour campagne ${vague.idCampagne} (${vague.Campagne ? vague.Campagne.nomCampagne : 'N/A'})`);

      if (!vague.Campagne) {
          console.warn(`[Scheduler] Vague ${vague.idVague} sans campagne associée. Passage.`);
          vague.statut = 'ERREUR_NO_CAMP';
          await vague.save();
          continue;
      }

      // 2. Récupérer les destinataires non encore envoyés pour cette campagne (limité au quota)
      const destinataires = await CampagneDestinataire.findAll({
        where: {
          idCampagne: vague.idCampagne,
          estEnvoye: false
        },
        limit: vague.quota || 1000
      });

      if (destinataires.length > 0) {
        // 3. Récupérer les infos contacts pour avoir les numéros
        const contactIds = destinataires.map(d => d.idContact);
        const contacts = await Contact.findAll({
          where: { idContact: { [Op.in]: contactIds } }
        });

        // 4. Créer les entrées dans la table 'sms'
        const smsToCreate = destinataires.map(dest => {
          const contact = contacts.find(c => c.idContact == dest.idContact);
          if (!contact) return null;

          // Remplacement basique des tags
          let message = vague.Campagne.messageTemplate;
          message = message.replace(/{nom}/g, contact.nom || '');
          message = message.replace(/{fonction}/g, contact.fonction || '');

          return {
            contenuSMS: message,
            numeroDestinataire: contact.telephone,
            statut: 0, // PENDING
            idCampagne: vague.idCampagne,
            dateEnregistrementSms: new Date(),
            heureEnregistrementSms: new Date().toTimeString().split(' ')[0]
          };
        }).filter(s => s !== null);

        if (smsToCreate.length > 0) {
          await Sms.bulkCreate(smsToCreate);

          // 5. Marquer les destinataires comme "envoyés" (dans le sens "mis en file d'attente SMS")
          await CampagneDestinataire.update(
            { estEnvoye: true },
            { where: { idCampagne: vague.idCampagne, idContact: { [Op.in]: contactIds } } }
          );
        }
      }

      // 6. Marquer la vague comme TERMINEE
      vague.statut = 'TERMINE';
      await vague.save();

      // 7. Vérifier si toute la campagne est finie
      const restants = await CampagneDestinataire.count({
        where: { idCampagne: vague.idCampagne, estEnvoye: false }
      });

      if (restants === 0) {
        await Campagne.update(
          { statut: 'TERMINÉ' },
          { where: { idCampagne: vague.idCampagne } }
        );
      } else {
        await Campagne.update(
          { statut: 'EN_COURS' },
          { where: { idCampagne: vague.idCampagne } }
        );
      }
    }
  } catch (error) {
    console.error('[Scheduler Error]', error);
  }
}, 60 * 1000); // Exécution toutes les 60 secondes
*/

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log('================================================');
    console.log(`🚀 SMS TASK API démarrée avec succès !`);
    console.log(`🌍 URL Serveur : http://localhost:${port}`);
    console.log(`📅 Date : ${new Date().toLocaleString()}`);
    console.log(`🗄️  Base de données : ${process.env.DB_NAME || 'sms_bd'} sur ${process.env.DB_HOST || 'localhost'}`);
    console.log('================================================');
});
