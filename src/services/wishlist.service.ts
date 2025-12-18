import pool from "../config/database";
import { CreateWishlist, UpdateWishlist, Wishlist } from "../schemas";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const getById = async (id: number): Promise<Wishlist | null> => {
    const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM wishlists WHERE id = ?",
        [id],
    );

    return (rows[0] as Wishlist) || null;
};

export const create = async (data: CreateWishlist): Promise<Wishlist> => {
    const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO wishlists (title, owner_name) VALUES (?, ?)",
        [data.title, data.owner_name],
    );
    return getById(result.insertId) as Promise<Wishlist>;
};

export const getByIdWithGifts = async (id: number) => {
    const wishlist = await getById(id);
    if (!wishlist) return null;

    const [gifts] = await pool.execute<RowDataPacket[]>(
        "SELECT id, name, image_url, link, price, priority, notes, created_at, updated_at FROM gifts WHERE wishlist_id = ? ORDER BY priority DESC, created_at ASC",
        [id],
    );

    return {
        ...wishlist,
        gifts,
    };
};

export const getByToken = async (token: string) => {
    const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM wishlists WHERE secret_token = ? AND is_published = TRUE",
        [token],
    );
    
    return rows[0] || null;
};


