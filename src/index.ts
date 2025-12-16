import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*'
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Secret Santa Wishlist Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});