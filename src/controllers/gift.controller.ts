import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import * as giftService from "../services/gift.service";
import * as wishlistService from "../services/wishlist.service";

/**
 * Updates a gift
 * Note: Only works if the parent wishlist is not published
 * @route PUT /api/gifts/:id
 * @param req - Express request object with id param and update data in body
 * @param res - Express response object
 * @returns 200 status with updated gift, 404 if not found, or 403 if wishlist is published
 */
export const update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const gift = await giftService.getById(Number(id));

    if (!gift) {
        throw new AppError(404, "Regalo non trovato");
    }

    // Verifica che la wishlist non sia pubblicata
    const wishlist = await wishlistService.getById(gift.wishlist_id);
    if (wishlist?.is_published) {
        throw new AppError(403, "Impossibile modificare un regalo di una wishlist pubblicata");
    }

    const updated = await giftService.update(Number(id), req.body);
    res.json(updated);
};

/**
 * Deletes a gift
 * Note: Only works if the parent wishlist is not published
 * @route DELETE /api/gifts/:id
 * @param req - Express request object with id param
 * @param res - Express response object
 * @returns 200 status with success message, 404 if not found, or 403 if wishlist is published
 */
export const remove = async (req: Request, res: Response) => {
    const { id } = req.params;
    const gift = await giftService.getById(Number(id));

    if (!gift) {
        throw new AppError(404, "Regalo non trovato");
    }

    // Verifica che la wishlist non sia pubblicata
    const wishlist = await wishlistService.getById(gift.wishlist_id);
    if (wishlist?.is_published) {
        throw new AppError(403, "Impossibile eliminare un regalo di una wishlist pubblicata");
    }

    await giftService.remove(Number(id));
    res.json({ message: "Regalo eliminato con successo" });
};

/**
 * Returns a random unreserved gift from any published wishlist
 * @route GET /api/gifts/random
 * @param req - Express request object
 * @param res - Express response object
 * @returns 200 status with random gift, or 404 if no gifts available
 */
export const getRandom = async (req: Request, res: Response) => {
    const gift = await giftService.getRandomFromPublished();

    if (!gift) {
        throw new AppError(404, "Nessun regalo disponibile");
    }

    res.json(gift);
};
