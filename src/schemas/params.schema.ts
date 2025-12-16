import z from "zod";

/**
 * * Schema per parametri ID nelle route
 */
export const idParamSchema = z.object({
    id: z.coerce.number()
        .int('L\'ID deve essere un numero intero')
        .positive('L\'ID deve essere un numero positivo'),
});

/**
 * * Schema per parametro token
 */
export const tokenParamSchema = z.object({
    token: z.uuid('Il token deve essere un UUID valido'),
});

/**
 * * Schema per parametri prenotazione
 */
export const reserveParamsSchema = z.object({
    token: z.uuid(),
    giftId: z.coerce.number().int().positive(),
});

/**
 * * Schema per parametri preferiti
 */
export const savedParamsSchema = z.object({
    browserId: z.uuid(),
    wishlistId: z.coerce.number().int().positive().optional(),
});

export type IdParam = z.infer<typeof idParamSchema>;
export type TokenParam = z.infer<typeof tokenParamSchema>;
export type ReserveParams = z.infer<typeof reserveParamsSchema>;
export type SavedParams = z.infer<typeof savedParamsSchema>;