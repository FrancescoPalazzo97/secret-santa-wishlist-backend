import z from "zod";
import { giftSchema, publicGiftSchema } from "./gift.schema";

/**
 * * Schema base wishlist
 */
export const wishlistBaseSchema = z.object({
    title: z.string()
        .min(3, 'Il titolo deve avere almeno 3 caratteri')
        .max(100, 'Il titolo non può superare 100 caratteri')
        .trim(),

    owner_name: z.string()
        .min(2, 'Il nome del proprietario deve avere almeno 2 caratteri')
        .max(50, 'Il nome del proprietario non può superare 50 caratteri')
        .trim(),
});

/**
 * * Schema completo wishlist (include campi DB)
 */
export const wishlistSchema = wishlistBaseSchema.extend({
    id: z.number().int().positive(),
    secret_token: z.uuid().nullable().default(null),
    is_published: z.boolean().default(false),
    published_at: z.date().nullable().default(null),
    created_at: z.date().default(new Date()),
    updated_at: z.date().default(new Date()),
});

/**
 * * Schema per creazione wishlist
 */
export const createWishlistSchema = wishlistBaseSchema;

/**
 * * Schema per update wishlist (tutti i campi opzionali)
 */
export const updateWishlistSchema = wishlistBaseSchema.partial();

/**
 * * Schema wishlist con regali (risposta owner)
 */
export const wishlistWithGiftsSchema = wishlistSchema.extend({
    gifts: z.array(giftSchema.omit({
        is_reserved: true,
        reservation_message: true,
        reserved_at: true,
    })).default([]),
});

/**
 * * Schema wishlist pubblica (risposta visitor)
 */
export const publicWishlistSchema = z.object({
    title: z.string(),
    owner_name: z.string(),
    published_at: z.date(),
    gifts: z.array(publicGiftSchema).default([]),
});

// Types inferiti
export type Wishlist = z.infer<typeof wishlistSchema>;
export type CreateWishlist = z.infer<typeof createWishlistSchema>;
export type UpdateWishlist = z.infer<typeof updateWishlistSchema>;
export type WishlistWithGifts = z.infer<typeof wishlistWithGiftsSchema>;
export type PublicWishlist = z.infer<typeof publicWishlistSchema>;