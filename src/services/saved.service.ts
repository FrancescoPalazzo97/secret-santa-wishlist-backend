import pool from "../config/database";
import { SavedWishlist, SavedWishlistResponse } from "../schemas";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Ottiene tutte le wishlist salvate per un browser
 */
export const getByBrowserId = async (browserId: string): Promise<SavedWishlistResponse[]> => {
    const query = `
        SELECT
            sw.id,
            sw.wishlist_id,
            w.title,
            w.owner_name,
            w.secret_token,
            sw.saved_at
        FROM saved_wishlists sw
        INNER JOIN wishlists w ON sw.wishlist_id = w.id
        WHERE sw.browser_id = ? AND w.is_published = TRUE
        ORDER BY sw.saved_at DESC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [browserId]);
    return rows as SavedWishlistResponse[];
};

/**
 * Salva una wishlist nei preferiti
 */
export const save = async (data: SavedWishlist): Promise<{ id: number; browser_id: string; wishlist_id: number; saved_at: Date }> => {
    const query = `INSERT INTO saved_wishlists (browser_id, wishlist_id) VALUES (?, ?)`;
    const [result] = await pool.execute<ResultSetHeader>(query, [data.browser_id, data.wishlist_id]);

    return {
        id: result.insertId,
        browser_id: data.browser_id,
        wishlist_id: data.wishlist_id,
        saved_at: new Date(),
    };
};

/**
 * Rimuove una wishlist dai preferiti
 */
export const remove = async (browserId: string, wishlistId: number): Promise<boolean> => {
    const query = `DELETE FROM saved_wishlists WHERE browser_id = ? AND wishlist_id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(query, [browserId, wishlistId]);
    return result.affectedRows > 0;
};

/**
 * Verifica se una wishlist è già salvata nei preferiti
 */
export const exists = async (browserId: string, wishlistId: number): Promise<boolean> => {
    const query = `SELECT 1 FROM saved_wishlists WHERE browser_id = ? AND wishlist_id = ?`;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [browserId, wishlistId]);
    return rows.length > 0;
};
