import pool from "../config/database";
import { CreateGift, UpdateGift, Gift } from "../schemas";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { AppError } from "../middleware/errorHandler";

export const getById = async (id: number): Promise<Gift | null> => {
    const query = "SELECT * FROM gifts WHERE id = ?";

    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) return null;

    return rows[0] as Gift;
}

export const create = async (wishlistId: number, data: CreateGift): Promise<Gift> => {
    const query =
        `INSERT INTO gifts (wishlist_id, name, image_url, link, price, priority, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await pool.execute<ResultSetHeader>(
        query,
        [wishlistId, ...Object.values(data)]
    );

    const gift = await getById(result.insertId);

    if (!gift) {
        throw new AppError(500, "Errore nel recupero del regalo creato");
    }

    return gift;
}

export const getByWishlistId = async (wishlistId: number): Promise<Omit<Gift, 'is_reserved' | 'reservation_message' | 'reserved_at'>[]> => {
    const query =
        `SELECT id, wishlist_id, name, image_url, link, price, priority, notes, created_at, updated_at
        FROM gifts 
        WHERE wishlist_id = ?
        ORDER BY priority DESC, created_at ASC`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [wishlistId]);

    return rows as Omit<Gift, 'is_reserved' | 'reservation_message' | 'reserved_at'>[];
};

export const getByWishlistIdPublic = async (wishlistId: number): Promise<Partial<Gift>[]> => {
    const query =
        `SELECT id, name, image_url, link, price, priority, notes, is_reserved, reservation_message
        FROM gifts 
        WHERE wishlist_id = ?
        ORDER BY priority DESC, created_at ASC`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [wishlistId]);

    return rows as Partial<Gift>[];
};

export const update = async (id: number, data: UpdateGift): Promise<Gift | null> => {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    // * Vado a creare in modo dinamico la query iterando "data" come array e vedendo quali propietà sono state passate
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });

    // * Se non ci sono campi da aggiornare torno direttamente il regalo
    if (fields.length === 0) {
        return getById(id);
    }

    values.push(id);

    const query = `UPDATE gifts SET ${fields.join(', ')} WHERE id = ?`;

    await pool.execute(query, values);

    return getById(id);
};

export const remove = async (id: number): Promise<boolean> => {
    const query = `DELETE FROM gifts WHERE id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    return result.affectedRows > 0;
};

export const reserve = async (id: number, message?: string): Promise<Gift | null> => {
    const query =
        `UPDATE gifts 
        SET is_reserved = TRUE, 
            reservation_message = ?, 
            reserved_at = NOW() 
        WHERE id = ? AND is_reserved = FALSE`;

    const [result] = await pool.execute<ResultSetHeader>(query, [message || null, id]);

    // * Ritorno null in modo da gestira la casistica nella quale il regalo è già stato prenotato o non esiste
    if (result.affectedRows === 0) {
        return null;
    }

    return getById(id);
};


