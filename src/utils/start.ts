import pool from "../config/database";

export async function start(): Promise<void> {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Successfully connected to the database.");
        connection.release();
    } catch (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    }
}
