import pool from "../config/database";
import { CreateGift, UpdateGift, Gift } from "../schemas";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { AppError } from "../middleware/errorHandler";

/**
 * Retrieves a gift by its ID
 * @param id - The gift ID
 * @returns The gift object or null if not found
 */
export const getById = async (id: number): Promise<Gift | null> => {
    const query = "SELECT * FROM gifts WHERE id = ?";

    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) return null;

    return rows[0] as Gift;
}

/**
 * Creates a new gift for a specific wishlist
 * @param wishlistId - The ID of the wishlist to add the gift to
 * @param data - The gift data (name, image_url, link, price, priority, notes)
 * @returns The newly created gift
 * @throws {AppError} If the created gift cannot be retrieved
 */
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

/**
 * Retrieves all gifts for a specific wishlist (owner view)
 * Note: Excludes reservation data (is_reserved, reservation_message, reserved_at) for privacy
 * @param wishlistId - The wishlist ID
 * @returns Array of gifts without reservation information
 */
export const getByWishlistId = async (wishlistId: number): Promise<Omit<Gift, 'is_reserved' | 'reservation_message' | 'reserved_at'>[]> => {
    const query =
        `SELECT id, wishlist_id, name, image_url, link, price, priority, notes, created_at, updated_at
        FROM gifts 
        WHERE wishlist_id = ?
        ORDER BY priority DESC, created_at ASC`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [wishlistId]);

    return rows as Omit<Gift, 'is_reserved' | 'reservation_message' | 'reserved_at'>[];
};

/**
 * Retrieves all gifts for a specific wishlist (public/visitor view)
 * Note: Includes reservation status and message for visitors to see which gifts are taken
 * @param wishlistId - The wishlist ID
 * @returns Array of gifts with reservation information but without internal metadata
 */
export const getByWishlistIdPublic = async (wishlistId: number): Promise<Partial<Gift>[]> => {
    const query =
        `SELECT id, name, image_url, link, price, priority, notes, is_reserved, reservation_message
        FROM gifts 
        WHERE wishlist_id = ?
        ORDER BY priority DESC, created_at ASC`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [wishlistId]);

    return rows as Partial<Gift>[];
};

/**
 * Updates a gift with the provided data
 * Note: Dynamically builds query based on provided fields. Only works for unpublished wishlists
 * @param id - The gift ID
 * @param data - Partial gift data to update (any combination of name, image_url, link, price, priority, notes)
 * @returns The updated gift or null if not found
 */
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

/**
 * Deletes a gift from the database
 * @param id - The gift ID
 * @returns True if the gift was deleted, false if not found
 */
export const remove = async (id: number): Promise<boolean> => {
    const query = `DELETE FROM gifts WHERE id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    return result.affectedRows > 0;
};

/**
 * Reserves a gift by marking it as reserved with an optional message
 * Note: Only works if the gift is not already reserved (atomic operation)
 * @param id - The gift ID
 * @param message - Optional message from the person reserving the gift
 * @returns The reserved gift or null if already reserved or not found
 */
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

/**
 * Checks if a gift belongs to a specific wishlist
 * @param giftId - The gift ID
 * @param wishlistId - The wishlist ID
 * @returns True if the gift belongs to the wishlist, false otherwise
 */
export const belongsToWishlist = async (giftId: number, wishlistId: number): Promise<boolean> => {
    const query = `SELECT 1 FROM gifts WHERE id = ? AND wishlist_id = ?`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [giftId, wishlistId]);

    return rows.length > 0;
};

/**
 * Counts the total number of gifts in a wishlist
 * @param wishlistId - The wishlist ID
 * @returns The number of gifts in the wishlist
 */
export const countByWishlistId = async (wishlistId: number): Promise<number> => {
    const query = `SELECT COUNT(*) as count FROM gifts WHERE wishlist_id = ?`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [wishlistId]);

    return (rows[0] as { count: number }).count;
};

/**
 * Retrieves a random unreserved gift from all published wishlists
 * Useful for gift suggestion feature
 * @returns A random unreserved gift or null if none available
 */
export const getRandomFromPublished = async (): Promise<Partial<Gift> | null> => {
    const query =
        `SELECT g.id, g.name, g.image_url, g.link, g.price, g.priority, g.notes
        FROM gifts g
        INNER JOIN wishlists w ON g.wishlist_id = w.id
        WHERE w.is_published = TRUE 
        AND g.is_reserved = FALSE
        ORDER BY RAND()
        LIMIT 1`;

    const [rows] = await pool.execute<RowDataPacket[]>(query);

    if (rows.length === 0) return null;

    return rows[0] as Partial<Gift>;
};