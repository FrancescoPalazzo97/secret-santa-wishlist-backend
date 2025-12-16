import z from "zod";

/**
 * * Schema per prenotazione regalo
 */
export const reservationSchema = z.object({
    message: z.string()
        .max(255, 'Il messaggio non può superare 255 caratteri')
        .trim()
        .optional()
        .transform(val => val === '' ? null : val),
});

export type Reservation = z.infer<typeof reservationSchema>;