import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import * as wishlistService from "../services/wishlist.service";
import * as giftService from "../services/gift.service";

/**
 * Retrieves a published wishlist by its secret token (visitor view)
 * Note: Includes reservation data for visitors to see which gifts are taken
 * @route GET /api/public/:token
 * @param req - Express request object with token param
 * @param res - Express response object
 * @returns 200 status with public wishlist and gifts, or 404 if not found/not published
 */
export const getByToken = async (req: Request, res: Response) => {
    const { token } = req.params;
    const wishlist = await wishlistService.getByToken(token);

    if (!wishlist) {
        throw new AppError(404, "Wishlist non trovata o non pubblicata");
    }

    // Ottieni i regali con dati di prenotazione (vista pubblica)
    const gifts = await giftService.getByWishlistIdPublic(wishlist.id);

    res.json({
        title: wishlist.title,
        owner_name: wishlist.owner_name,
        published_at: wishlist.published_at,
        gifts,
    });
};

/**
 * Reserves a gift from a published wishlist
 * Requirements: Wishlist must be published, gift must belong to wishlist, gift must not be already reserved
 * @route POST /api/public/:token/gifts/:giftId/reserve
 * @param req - Express request object with token and giftId params, optional message in body
 * @param res - Express response object
 * @returns 200 status with success message and reserved gift, 404 if not found, or 409 if already reserved
 */
export const reserveGift = async (req: Request, res: Response) => {
    const { token, giftId } = req.params;
    const { message } = req.body;

    // Verifica che la wishlist esista e sia pubblicata
    const wishlist = await wishlistService.getByToken(token);
    if (!wishlist) {
        throw new AppError(404, "Wishlist non trovata o non pubblicata");
    }

    // Verifica che il regalo appartenga alla wishlist
    const belongsToWishlist = await giftService.belongsToWishlist(
        Number(giftId),
        wishlist.id
    );
    if (!belongsToWishlist) {
        throw new AppError(404, "Regalo non trovato in questa wishlist");
    }

    // Prova a prenotare il regalo (atomico)
    const reserved = await giftService.reserve(Number(giftId), message);
    if (!reserved) {
        throw new AppError(409, "Regalo già prenotato");
    }

    res.json({
        message: "Regalo prenotato con successo",
        gift: {
            id: reserved.id,
            name: reserved.name,
            is_reserved: reserved.is_reserved,
            reservation_message: reserved.reservation_message,
        },
    });
};
