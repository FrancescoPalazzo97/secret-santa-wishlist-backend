import express from 'express';
import cors from 'cors';
import pool from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';

const app = express();
const PORT = process.env.PORT || 3000;

async function start() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Successfully connected to the database.');
        connection.release();
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
}

app.use(cors({
    origin: '*'
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Secret Santa Wishlist Backend is running!');
});

app.get('/items', async (req, res) => {
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

app.use(errorHandler);
app.use(notFoundHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

start();