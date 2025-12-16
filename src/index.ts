import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import { start } from './utils/start';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*' // ! Permesse tutte le origini
}));
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Secret Santa Wishlist Backend is running!');
});

// * Middleware per la gestione degli errori e delle rotte non trovate
app.use(errorHandler);
app.use(notFoundHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

start();