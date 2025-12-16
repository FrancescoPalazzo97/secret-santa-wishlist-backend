import mysql from 'mysql2';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'secret_santa_wishlist',
    waitForConnections: true,
    // * Per evitare troppi collegamenti simultanei
    connectionLimit: 10,
    queueLimit: 100,
    // * Per mantenere vive le connessioni al database
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

export default pool.promise();
