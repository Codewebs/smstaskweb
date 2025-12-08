// routes/stats.js - Ajoutez des logs
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { Sms } = require('../models');
const { Op } = require("sequelize");

// GET /api/stats?period=day|week|month
router.get('/', async (req, res) => {
    try {
        console.log('📊 GET /api/stats called with period:', req.query.period);
        
        const { period = 'day' } = req.query;

        let where = {};

        if (period === "day") {
            // Aujourd'hui seulement
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            where.dateEnregistrementSms = {
                [Op.gte]: today,
                [Op.lt]: tomorrow
            };
            console.log('Day filter:', where.dateEnregistrementSms);
        } 
        else if (period === "week") {
            // Cette semaine
            const now = new Date();
            const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
            firstDay.setHours(0, 0, 0, 0);
            const lastDay = new Date(firstDay);
            lastDay.setDate(firstDay.getDate() + 6);
            lastDay.setHours(23, 59, 59, 999);
            
            where.dateEnregistrementSms = {
                [Op.between]: [firstDay, lastDay]
            };
            console.log('Week filter:', where.dateEnregistrementSms);
        }
        else if (period === "month") {
            // Ce mois
            const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);
            
            where.dateEnregistrementSms = {
                [Op.between]: [monthStart, monthEnd]
            };
            console.log('Month filter:', where.dateEnregistrementSms);
        }

        const total = await Sms.count({ where });
        const sent = await Sms.count({ where: { ...where, statut: 1 } });
        const failed = await Sms.count({ where: { ...where, statut: 2 } });
        const pending = await Sms.count({ where: { ...where, statut: 0 } });

        const result = { total, sent, failed, pending };
        console.log('📊 Stats result:', result);
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Error in /api/stats:', error);
        res.status(500).json({ 
            error: 'Database error',
            message: error.message 
        });
    }
});


// GET /api/stats/all - Pour avoir toutes les périodes en un seul appel
router.get('/all', async (req, res) => {
    try {
        console.log('📊 GET /api/stats/all called');
        
        // Today range
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Weekly range
        const now = new Date();
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        firstDay.setHours(0, 0, 0, 0);
        
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        lastDay.setHours(23, 59, 59, 999);

        // Monthly range
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        // Daily stats
        const daily = {
            total: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [todayStart, todayEnd] 
                    }
                } 
            }),
            sent: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [todayStart, todayEnd] 
                    }, 
                    statut: 1 
                } 
            }),
            failed: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [todayStart, todayEnd] 
                    }, 
                    statut: 2 
                } 
            }),
            pending: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [todayStart, todayEnd] 
                    }, 
                    statut: 0 
                } 
            }),
        };

        // Weekly stats
        const weekly = {
            total: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [firstDay, lastDay] 
                    }
                } 
            }),
            sent: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [firstDay, lastDay] 
                    }, 
                    statut: 1 
                } 
            }),
            failed: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [firstDay, lastDay] 
                    }, 
                    statut: 2 
                } 
            }),
            pending: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [firstDay, lastDay] 
                    }, 
                    statut: 0 
                } 
            }),
        };

        // Monthly stats
        const monthly = {
            total: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [monthStart, monthEnd] 
                    }
                } 
            }),
            sent: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [monthStart, monthEnd] 
                    }, 
                    statut: 1 
                } 
            }),
            failed: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [monthStart, monthEnd] 
                    }, 
                    statut: 2 
                } 
            }),
            pending: await Sms.count({ 
                where: { 
                    dateEnregistrementSms: { 
                        [Op.between]: [monthStart, monthEnd] 
                    }, 
                    statut: 0 
                } 
            }),
        };

        const result = { daily, weekly, monthly };
        console.log('📊 All stats result:', result);
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Error in /api/stats/all:', error);
        res.status(500).json({ 
            error: 'Database error',
            message: error.message 
        });
    }
});

module.exports = router;