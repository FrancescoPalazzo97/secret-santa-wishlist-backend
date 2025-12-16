import { Router } from "express";
import pool from '../config/database';

const router = Router();

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
})

router.get('/items', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM wishlists');
        console.log(result);
        const [rows] = result;
        res.json(rows);
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;