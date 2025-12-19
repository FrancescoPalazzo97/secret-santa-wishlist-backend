import pool from "../config/database";
import { CreateWishlist, UpdateWishlist, Wishlist } from "../schemas";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Retrieves a wishlist by its ID
 * @param id - The wishlist ID
 * @returns The wishlist object or null if not found
 */
export const getById = async (id: number): Promise<Wishlist | null> => {
    const query =
        `SELECT * FROM wishlists
        WHERE id = ?`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

    return (rows[0] as Wishlist) || null;
};

/**
 * Creates a new wishlist
 * @param data - The wishlist data (title and owner_name)
 * @returns The newly created wishlist
 */
export const create = async (data: CreateWishlist): Promise<Wishlist> => {
    const query = `INSERT INTO wishlists (title, owner_name) VALUES (?, ?)`;

    const [result] = await pool.execute<ResultSetHeader>(query, Object.values(data));

    return getById(result.insertId) as Promise<Wishlist>;
};

/**
 * Retrieves a wishlist by its ID along with all associated gifts
 * @param id - The wishlist ID
 * @returns The wishlist object with gifts array, or null if not found
 */
export const getByIdWithGifts = async (id: number) => {
    const wishlist = await getById(id);

    if (!wishlist) return null;

    const query =
        `SELECT id, name, image_url, link, price, priority, notes, created_at, updated_at
        FROM gifts
        WHERE wishlist_id = ?
        ORDER BY priority DESC, created_at ASC`;

    const [gifts] = await pool.execute<RowDataPacket[]>(query, [id]);

    return {
        ...wishlist,
        gifts,
    };
};

/**
 * Retrieves a published wishlist by its secret token
 * @param token - The UUID secret token
 * @returns The wishlist object or null if not found or not published
 */
export const getByToken = async (token: string) => {
    const query =
        `SELECT * FROM wishlists
        WHERE secret_token = ? AND is_published = TRUE`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [token]);

    return rows[0] || null;
};

/**
 * Updates a wishlist with the provided data
 * Note: Only works for wishlists that are not published
 * @param id - The wishlist ID
 * @param data - Partial wishlist data to update (title and/or owner_name)
 * @returns The updated wishlist or null if not found
 */
export const update = async (id: number, data: UpdateWishlist): Promise<Wishlist | null> => {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
        fields.push("title = ?");
        values.push(data.title);
    }

    if (data.owner_name !== undefined) {
        fields.push("owner_name = ?");
        values.push(data.owner_name);
    }

    if (fields.length === 0) {
        return getById(id);
    }

    values.push(id);

    const query =
        `UPDATE wishlists
        SET ${fields.join(", ")}
        WHERE id = ?`;

    await pool.execute<ResultSetHeader>(query, values);

    return getById(id);
};

/**
 * Deletes a wishlist and all associated gifts (cascade delete)
 * @param id - The wishlist ID
 * @returns True if the wishlist was deleted, false if not found
 */
export const remove = async (id: number): Promise<boolean> => {
    const query =
        `DELETE FROM wishlists
        WHERE id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    return result.affectedRows > 0;
};

/**
 * Publishes a wishlist by generating a unique secret token
 * Sets is_published to true and records the publication timestamp
 * @param id - The wishlist ID
 * @returns The published wishlist with the generated token
 */
export const publish = async (id: number): Promise<Wishlist> => {
    const token = crypto.randomUUID();

    const query =
        `UPDATE wishlists
        SET secret_token = ?, is_published = TRUE, published_at = NOW()
        WHERE id = ?`;

    await pool.execute<ResultSetHeader>(query, [token, id]);

    return getById(id) as Promise<Wishlist>;
}