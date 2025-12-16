import z from "zod";

/**
 * * Schema base per la validazione dei regali
 * ! Usato come fondamento per create/update
 */
export const giftBaseSchema = z.object({
    name: z.string()
        .min(2, 'Il nome deve avere almeno 2 caratteri')
        .max(150, 'Il nome non può superare 150 caratteri'),

    image_url: z.string()
        .url('Insersci un URL valido per l\'immagine del regalo')
        .max(255, 'URL troppo lungo, massimo 255 caratteri'),

    link: z.string()
        .url('Insersci un URL valido per il link del regalo')
        .max(255, 'URL troppo lungo, massimo 255 caratteri'),

    price: z.coerce.number()
        .nonnegative('Il prezzo non può essere negativo')
        .max(10000, 'Il prezzo non può superare 10.000')
        .multipleOf(0.01, 'Il prezzo deve essere un valore valido con al massimo due decimali'),

    priority: z.coerce.number()
        .int('La priorità deve essere un numero intero')
        .min(1, 'La priorità deve essere almeno 1')
        .max(5, 'La priorità non può superare 5'),

    notes: z.string()
        .max(500, 'Le note non possono superare 500 caratteri')
        .trim()
        .optional()
        .nullable()
        .transform(val => val === '' ? null : val),
})

/**
 * * Schema completo regalo (include campi DB)
 */
export const giftSchema = giftBaseSchema.extend({
    id: z.number().int().positive(),
    wishlist_id: z.number().int().positive(),
    is_reserved: z.boolean().default(false),
    reservation_message: z.string().max(255).nullable().default(null),
    reserved_at: z.date().nullable().default(null),
    created_at: z.date().default(new Date()),
    updated_at: z.date().default(new Date()),
});

/**
 * * Schema per creazione regalo (senza campi auto-generati)
 */
export const createGiftSchema = giftBaseSchema;

/**
 * * Schema per update regalo (tutti i campi opzionali)
 */
export const updateGiftSchema = giftBaseSchema.partial();

/**
 * * Schema regalo per visualizzazione pubblica
 */
export const publicGiftSchema = z.object({
    id: z.number(),
    name: z.string(),
    Image_url: z.string(),
    link: z.string(),
    price: z.number(),
    priority: z.number(),
    notes: z.string().nullable(),
    is_reserved: z.boolean(),
    reservation_message: z.string().nullable(),
})

// * Types inferiti
export type Gift = z.infer<typeof giftSchema>;
export type CreateGift = z.infer<typeof createGiftSchema>;
export type UpdateGift = z.infer<typeof updateGiftSchema>;
export type PublicGift = z.infer<typeof publicGiftSchema>;