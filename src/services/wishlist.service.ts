import pool from "../config/database";
import { CreateWishlist, UpdateWishlist, Wishlist } from "../schemas";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const getById = async (id: number): Promise<Wishlist | null> => {
    const query =
        `SELECT * FROM wishlists
        WHERE id = ?`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

    return (rows[0] as Wishlist) || null;
};

export const create = async (data: CreateWishlist): Promise<Wishlist> => {
    const query = `INSERT INTO wishlists (title, owner_name) VALUES (?, ?)`;

    const [result] = await pool.execute<ResultSetHeader>(query, [
        data.title,
        data.owner_name,
    ]);

    return getById(result.insertId) as Promise<Wishlist>;
};

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

export const getByToken = async (token: string) => {
    const query =
        `SELECT * FROM wishlists
        WHERE secret_token = ? AND is_published = TRUE`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [token]);

    return rows[0] || null;
};


export const update = async (id: number, data: UpdateWishlist): Promise<Wishlist | null> => {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
        fields.push("title = ?");
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

export const remove = async (id: number): Promise<boolean> => {
    const query =
        `DELETE FROM wishlists
        WHERE id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    return result.affectedRows > 0;
};

export const publish = async (id: number): Promise<Wishlist> => {
    const token = crypto.randomUUID();

    const query =
        `UPDATE wishlists
        SET secret_token = ?, is_published = TRUE, published_at = NOW()
        WHERE id = ?`;

    await pool.execute<ResultSetHeader>(query, [token, id]);

    return getById(id) as Promise<Wishlist>;
}