const express = require('express');
const router = express.Router();
const { Groupe, Contact, Sms } = require('../models');

// GET /groupes
router.get('/', async (req, res) => {
    try {
        const groupes = await Groupe.findAll({
            include: [{ model: Contact, attributes: ['idContact'] }]
        });
        res.json(groupes);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// POST /groupes
router.post('/', async (req, res) => {
    const { nomGroupe, description } = req.body;
    try {
        const groupe = await Groupe.create({ nomGroupe, description });
        res.status(201).json(groupe);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// DELETE /groupes/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Vérifier si un membre du groupe a un message en attente
        const contacts = await Contact.findAll({ where: { idGroupe: id } });
        const telephones = contacts.map(c => c.telephone);

        if (telephones.length > 0) {
            const pendingSms = await Sms.findOne({
                where: {
                    numeroDestinataire: telephones,
                    statut: 0
                }
            });

            if (pendingSms) {
                return res.status(403).json({ error: 'PENDING_SMS_EXISTS_FOR_MEMBER' });
            }
        }

        await Groupe.destroy({ where: { idGroupe: id } });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

module.exports = router;
