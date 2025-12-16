import z from "zod";

/**
 * * Schema per salvare wishlist nei preferiti
 */
export const savedWishlistSchema = z.object({
    browser_id: z.uuid(),

    wishlist_id: z.number()
        .int('L\'ID della wishlist deve essere un numero intero')
        .positive('L\'ID della wishlist deve essere un numero positivo'),
});

/**
 * * Schema risposta wishlist salvata
 */
export const savedWishlistResponseSchema = z.object({
    id: z.number(),
    wishlist_id: z.number(),
    title: z.string(),
    owner_name: z.string(),
    secret_token: z.string(),
    saved_at: z.date(),
})

export type SavedWishlist = z.infer<typeof savedWishlistSchema>;
export type SavedWishlistResponse = z.infer<typeof savedWishlistResponseSchema>;