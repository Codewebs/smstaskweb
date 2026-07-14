const express = require('express');
const router = express.Router();
const { Contact, Sms, Groupe, Sequelize } = require('../models');
const { Op } = Sequelize;

// GET /contacts - Liste tous les contacts
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.findAll({
            include: [{ model: Groupe, attributes: ['nomGroupe'] }]
        });
        res.json(contacts);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// POST /contacts - Ajouter un contact (avec vérification de doublon par numéro)
router.post('/', async (req, res) => {
    const { nom, telephone, idGroupe } = req.body;
    if (!telephone) return res.status(400).json({ error: 'PHONE_REQUIRED' });

    try {
        const [contact, created] = await Contact.findOrCreate({
            where: { telephone },
            defaults: { nom, idGroupe }
        });

        if (!created) {
            return res.status(409).json({ error: 'DUPLICATE_PHONE', contact });
        }

        res.status(201).json(contact);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// POST /contacts/bulk - Import CSV (Liste de contacts)
router.post('/bulk', async (req, res) => {
    const { contacts } = req.body; // Expecting [{nom, telephone, idGroupe}, ...]
    if (!Array.isArray(contacts)) return res.status(400).json({ error: 'INVALID_DATA' });

    try {
        let addedCount = 0;
        let duplicateCount = 0;

        for (const c of contacts) {
            const [contact, created] = await Contact.findOrCreate({
                where: { telephone: c.telephone },
                defaults: { nom: c.nom, idGroupe: c.idGroupe }
            });
            if (created) addedCount++;
            else duplicateCount++;
        }

        res.json({ addedCount, duplicateCount });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// PUT /contacts/:id - Modifier un contact
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nom, telephone, idGroupe } = req.body;

    try {
        // Vérifier si des messages non envoyés existent pour ce numéro
        const contact = await Contact.findByPk(id);
        if (!contact) return res.status(404).json({ error: 'NOT_FOUND' });

        const pendingSms = await Sms.findOne({
            where: {
                numeroDestinataire: contact.telephone,
                statut: 0 // Pending
            }
        });

        if (pendingSms) {
            return res.status(403).json({ error: 'PENDING_SMS_EXISTS' });
        }

        await Contact.update({ nom, telephone, idGroupe }, { where: { idContact: id } });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// DELETE /contacts/:id - Supprimer un contact
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const contact = await Contact.findByPk(id);
        if (!contact) return res.status(404).json({ error: 'NOT_FOUND' });

        const pendingSms = await Sms.findOne({
            where: {
                numeroDestinataire: contact.telephone,
                statut: 0
            }
        });

        if (pendingSms) {
            return res.status(403).json({ error: 'PENDING_SMS_EXISTS' });
        }

        await Contact.destroy({ where: { idContact: id } });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

module.exports = router;
