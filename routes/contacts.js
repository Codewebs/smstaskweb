const express = require('express');
const router = express.Router();
const { Contact, Sms, Groupe, Sequelize } = require('../models');
const { Op } = Sequelize;

// GET /contacts - Liste tous les contacts (exclure les éphémères par défaut ?)
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.findAll({
            where: { isEphemeral: false }, // On ne liste que les vrais contacts dans la BD principale
            include: [{ model: Groupe, attributes: ['nomGroupe'] }]
        });
        res.json(contacts);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// POST /contacts - Ajouter un contact
router.post('/', async (req, res) => {
    const { nom, telephone, idGroupe, fonction } = req.body;
    if (!telephone) return res.status(400).json({ error: 'PHONE_REQUIRED' });

    try {
        const [contact, created] = await Contact.findOrCreate({
            where: { telephone },
            defaults: { nom, idGroupe, fonction, isEphemeral: false }
        });

        if (!created) {
            // Si c'était un contact éphémère, on le transforme en vrai contact
            if (contact.isEphemeral) {
                contact.isEphemeral = false;
                contact.nom = nom || contact.nom;
                contact.idGroupe = idGroupe || contact.idGroupe;
                contact.fonction = fonction || contact.fonction;
                await contact.save();
            } else {
                return res.status(409).json({ error: 'DUPLICATE_PHONE', contact });
            }
        }

        res.status(201).json(contact);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// POST /contacts/bulk - Import CSV
router.post('/bulk', async (req, res) => {
    const { contacts } = req.body;
    if (!Array.isArray(contacts)) return res.status(400).json({ error: 'INVALID_DATA' });

    try {
        let addedCount = 0;
        let duplicateCount = 0;

        for (const c of contacts) {
            const [contact, created] = await Contact.findOrCreate({
                where: { telephone: c.telephone },
                defaults: { nom: c.nom, idGroupe: c.idGroupe, fonction: c.fonction, isEphemeral: false }
            });
            if (created) addedCount++;
            else {
                if (contact.isEphemeral) {
                    contact.isEphemeral = false;
                    await contact.save();
                    addedCount++;
                } else {
                    duplicateCount++;
                }
            }
        }

        res.json({ addedCount, duplicateCount });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// PUT /contacts/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nom, telephone, idGroupe, fonction } = req.body;

    try {
        const contact = await Contact.findByPk(id);
        if (!contact) return res.status(404).json({ error: 'NOT_FOUND' });

        const pendingSms = await Sms.findOne({
            where: { numeroDestinataire: contact.telephone, statut: 0 }
        });

        if (pendingSms) return res.status(403).json({ error: 'PENDING_SMS_EXISTS' });

        await Contact.update({ nom, telephone, idGroupe, fonction }, { where: { idContact: id } });
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
            where: { numeroDestinataire: contact.telephone, statut: 0 }
        });

        if (pendingSms) return res.status(403).json({ error: 'PENDING_SMS_EXISTS' });

        await Contact.destroy({ where: { idContact: id } });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// DELETE /contacts/ephemeral/cleanup - Nettoyer les contacts éphémères
router.delete('/cleanup/ephemeral', async (req, res) => {
    try {
        // Supprime les contacts éphémères qui ne sont plus dans aucune campagne
        const [results] = await Contact.sequelize.query(`
            DELETE FROM contacts
            WHERE isEphemeral = true
            AND idContact NOT IN (SELECT idContact FROM campagne_destinataires)
        `);
        res.json({ ok: true, deletedCount: results.affectedRows });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'CLEANUP_ERROR' });
    }
});

module.exports = router;
