const express = require('express');
const router = express.Router();
const { Campagne, CampagneVague, CampagneDestinataire, Contact, Sequelize } = require('../models');

// GET /campagnes - Liste toutes les campagnes avec stats
router.get('/', async (req, res) => {
    try {
        const campagnes = await Campagne.findAll();

        const results = await Promise.all(campagnes.map(async (c) => {
            const total = await CampagneDestinataire.count({ where: { idCampagne: c.idCampagne } });
            const sent = await CampagneDestinataire.count({ where: { idCampagne: c.idCampagne, estEnvoye: true } });

            const percentage = total > 0 ? (sent / total) * 100 : 0;

            return {
                idCampagne: Number(c.idCampagne),
                nomCampagne: c.nomCampagne,
                messageTemplate: c.messageTemplate,
                statut: c.statut,
                createdAt: c.createdAt ? new Date(c.createdAt).getTime() : Date.now(),
                totalContacts: Number(total),
                sentContacts: Number(sent),
                percentage: Number(percentage)
            };
        }));

        res.json(results);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// GET /campagnes/:id - Détails d'une campagne
router.get('/:id', async (req, res) => {
    try {
        const c = await Campagne.findByPk(req.params.id, {
            include: [{ model: CampagneVague }]
        });

        if (!c) return res.status(404).json({ error: 'NOT_FOUND' });

        const destRows = await CampagneDestinataire.findAll({
            where: { idCampagne: c.idCampagne }
        });

        // On enrichit les destinataires avec les infos contacts
        const enrichedDests = await Promise.all(destRows.map(async (d) => {
            const contact = await Contact.findByPk(d.idContact);
            return {
                idContact: Number(d.idContact),
                nom: contact ? contact.nom : 'Inconnu',
                telephone: contact ? contact.telephone : '',
                estEnvoye: Boolean(d.estEnvoye)
            };
        }));

        res.json({
            idCampagne: Number(c.idCampagne),
            nomCampagne: c.nomCampagne,
            messageTemplate: c.messageTemplate,
            statut: c.statut,
            createdAt: c.createdAt ? new Date(c.createdAt).getTime() : Date.now(),
            vagues: (c.CampagneVagues || []).map(v => ({
                idVague: Number(v.idVague),
                datePrevue: v.datePrevue,
                heurePrevue: v.heurePrevue,
                quota: Number(v.quota),
                statut: v.statut
            })),
            destinataires: enrichedDests
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// POST /campagnes - Créer une campagne
router.post('/', async (req, res) => {
    const { nomCampagne, messageTemplate, destinataires, vagues } = req.body;
    try {
        const result = await Campagne.create({
            nomCampagne,
            messageTemplate,
            statut: 'PROGRAMMÉ'
        });

        if (vagues && vagues.length > 0) {
            await CampagneVague.bulkCreate(vagues.map(v => ({
                idCampagne: result.idCampagne,
                datePrevue: v.datePrevue,
                heurePrevue: v.heurePrevue,
                quota: v.quota,
                statut: 'EN_ATTENTE'
            })));
        }

        if (destinataires && destinataires.length > 0) {
            await CampagneDestinataire.bulkCreate(destinataires.map(id => ({
                idCampagne: result.idCampagne,
                idContact: id,
                estEnvoye: false
            })));
        }

        // Retourner un objet compatible avec CampagneResponse (createdAt en Long)
        res.status(201).json({
            idCampagne: Number(result.idCampagne),
            nomCampagne: result.nomCampagne,
            messageTemplate: result.messageTemplate,
            statut: result.statut,
            createdAt: result.createdAt ? new Date(result.createdAt).getTime() : Date.now(),
            totalContacts: destinataires ? destinataires.length : 0,
            sentContacts: 0,
            percentage: 0
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// DELETE /campagnes/:id - Supprimer une campagne
router.delete('/:id', async (req, res) => {
    try {
        await Campagne.destroy({ where: { idCampagne: req.params.id } });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// DELETE /campagnes/:id/destinataires/:contactId - Retirer un destinataire
router.delete('/:id/destinataires/:contactId', async (req, res) => {
    try {
        await CampagneDestinataire.destroy({
            where: {
                idCampagne: req.params.id,
                idContact: req.params.contactId
            }
        });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

module.exports = router;
