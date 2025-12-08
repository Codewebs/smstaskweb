const express = require('express');
const router = express.Router();
const { Sms } = require('../models');
const pool = require('../db');

// 📌 1) GET /sms/pending
router.get('/pending', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '20'), 1000);

    try {
        const rows = await Sms.findAll({
            attributes: ['idSms', 'contenuSMS', 'numeroDestinataire'],
            where: {
                statut: 0  // ← FILTRE CRITIQUE !
            },
            order: [['idSms', 'ASC']],
            limit
        });

        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// 📌 POST /sms/:id/mark-swiped  → statut = 4
router.post('/:id/mark-swiped', async (req, res) => {
    try {
        const sms = await Sms.findByPk(req.params.id);

        if (!sms) return res.status(404).json({ error: "Not found" });

        sms.statut = 4;  
        sms.dateEnvoiSms = new Date();
        sms.heureEnvoiSms = new Date();

        await sms.save();

        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "DB_ERROR" });
    }
});


// POST /sms/:id/mark-sent
router.post('/:id/mark-sent', async (req, res) => {
    try {
        const sms = await Sms.findByPk(req.params.id);

        if (!sms) return res.status(404).json({ error: "Not found" });

        sms.statut = "1"; // SENT (STRING car ton modèle le définit comme STRING)
        sms.dateEnvoiSms = new Date(); // DATE ok

        // Format HH:mm:ss
        const now = new Date();
        const formattedTime =
            now.toTimeString().split(" ")[0];  

        sms.heureEnvoiSms = formattedTime; // TIME ONLY

        await sms.save();

        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});


// POST /sms/:id/mark-failed
router.post('/:id/mark-failed', async (req, res) => {
    try {
        const sms = await Sms.findByPk(req.params.id);

        if (!sms) return res.status(404).json({ error: "Not found" });

        sms.statut = 2; // FAILED
        await sms.save();

        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// 📌 4) POST /sms/:id/mark-delivered (statut = 3) - Optionnel
router.post('/:id/mark-delivered', async (req, res) => {
    try {
        const sms = await Sms.findByPk(req.params.id);

        if (!sms) return res.status(404).json({ error: "Not found" });

        sms.statut = "3"; // delivered

        await sms.save();

        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

// 📌 4) GET /sms/recent
router.get('/recent', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);

    try {
        const [rows] = await pool.query(`
            SELECT
                idSms,
                contenuSMS,
                numeroDestinataire,
                DATE_FORMAT(dateEnregistrementSms, '%Y-%m-%d') as date,
                TIME_FORMAT(heureEnregistrementSms, '%H:%i') as time,
                statut
            FROM sms
            ORDER BY dateEnregistrementSms DESC, heureEnregistrementSms DESC
            LIMIT ?
        `, [limit]);

        const formatted = rows.map(row => ({
            idSms: row.idSms,
            numeroDestinataire: row.numeroDestinataire,
            contenuSMS: row.contenuSMS,
            date: row.date,
            time: row.time,
            status: row.statut === 1 ? 'SENT' :
                    row.statut === 2 ? 'FAILED' : 'PENDING'
        }));

        res.json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'DB_ERROR' });
    }
});

module.exports = router;
