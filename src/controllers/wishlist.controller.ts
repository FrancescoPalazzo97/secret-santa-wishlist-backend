import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import * as wishlistService from "../services/wishlist.service";
import * as giftService from '../services/gift.service';

/**
 * Creates a new wishlist
 * @route POST /api/wishlists
 * @param req - Express request object with wishlist data in body
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns 201 status with created wishlist
 */
export const create = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const wishlist = await wishlistService.create(req.body);
        res.status(201).json(wishlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

/**
 * Retrieves a wishlist by ID with all its gifts (owner view)
 * Note: Excludes reservation data from gifts for privacy
 * @route GET /api/wishlists/:id
 * @param req - Express request object with id param
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns 200 status with wishlist and gifts, or 404 if not found
 */
export const getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const wishlist = await wishlistService.getByIdWithGifts(Number(id));

        if (!wishlist) {
            throw new AppError(404, "Wishlist non trovata!");
        }

        res.json(wishlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

/**
 * Updates a wishlist
 * Note: Only works if the wishlist is not published
 * @route PUT /api/wishlists/:id
 * @param req - Express request object with id param and update data in body
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns 200 status with updated wishlist, 404 if not found, or 403 if already published
 */
export const update = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const wishlist = await wishlistService.getById(Number(id));

        if (!wishlist) {
            throw new AppError(404, "Wishlist non trovata!");
        }

        if (wishlist.is_published) {
            throw new AppError(
                403,
                "Impossibile modificare una wishlist pubblicata!",
            );
        }

        const updated = await wishlistService.update(Number(id), req.body);
        res.json(updated);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

/**
 * Deletes a wishlist and all associated gifts (cascade delete)
 * @route DELETE /api/wishlists/:id
 * @param req - Express request object with id param
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns 200 status with success message, or 404 if not found
 */
export const remove = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const deleted = await wishlistService.remove(Number(id));

        if (!deleted) {
            throw new AppError(404, "Wishlist non trovata!");
        }

        res.json({ message: "Wishlist eliminata con successo!" });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

/**
 * Publishes a wishlist by generating a unique secret token
 * Requirements: Wishlist must exist, not be already published, and contain at least one gift
 * @route POST /api/wishlists/:id/publish
 * @param req - Express request object with id param
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns 200 status with published wishlist and public URL, 404 if not found, 403 if already published, or 400 if empty
 */
export const publish = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const wishlist = await wishlistService.getById(Number(id));

        if (!wishlist) {
            throw new AppError(404, "Wishlist non trovata!");
        }

        if (wishlist.is_published) {
            throw new AppError(403, "Wishlist già pubblicata");
        }

        // Verifica che ci siano i regali
        const gifts = await giftService.getByWishlistId(Number(id));
        if (gifts.length === 0) {
            throw new AppError(400, "Impossibile pubblicare una wishlist vuota!");
        }

        const published = await wishlistService.publish(Number(id));
        res.json({
            ...published,
            public_url: `/wishlist/${published.secret_token}`
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

/**
 * Adds a new gift to a wishlist
 * Note: Only works if the wishlist is not published
 * @route POST /api/wishlists/:id/gifts
 * @param req - Express request object with id param and gift data in body
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns 201 status with created gift, 404 if wishlist not found, or 403 if already published
 */
export const addGift = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const wishlist = await wishlistService.getById(Number(id));

        if (!wishlist) {
            throw new AppError(404, "Wishlist non trovata");
        }

        if (wishlist.is_published) {
            throw new AppError(
                403,
                "Impossibile aggiungere regali a una wishlist pubblicata",
            );
        }

        const gift = await giftService.create(Number(id), req.body);
        res.status(201).json(gift);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

/**
 * Retrieves all gifts for a specific wishlist (owner view)
 * Note: Excludes reservation data from gifts for privacy
 * @route GET /api/wishlists/:id/gifts
 * @param req - Express request object with id param
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns 200 status with array of gifts
 */
export const getGifts = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const gifts = await giftService.getByWishlistId(Number(id));
        res.json({ gifts });
    } catch (error) {
        console.error(error);
        next(error);
    }
}
