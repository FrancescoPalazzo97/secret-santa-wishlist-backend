import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import * as savedService from "../services/saved.service";
import * as wishlistService from "../services/wishlist.service";

/**
 * Retrieves all saved wishlists for a specific browser
 * @route GET /api/saved/:browserId
 * @param req - Express request object with browserId param
 * @param res - Express response object
 * @returns 200 status with array of saved wishlists
 */
export const getByBrowserId = async (req: Request, res: Response) => {
    const { browserId } = req.params;
    const savedWishlists = await savedService.getByBrowserId(browserId);
    res.json({ saved_wishlists: savedWishlists });
};

/**
 * Saves a wishlist to favorites
 * Requirements: Wishlist must exist and not already be saved
 * @route POST /api/saved
 * @param req - Express request object with browser_id and wishlist_id in body
 * @param res - Express response object
 * @returns 201 status with saved entry, 404 if wishlist not found, or 409 if already saved
 */
export const save = async (req: Request, res: Response) => {
    const { browser_id, wishlist_id } = req.body;

    // Verifica che la wishlist esista
    const wishlist = await wishlistService.getById(wishlist_id);
    if (!wishlist) {
        throw new AppError(404, "Wishlist non trovata");
    }

    // Verifica che non sia già salvata
    const alreadySaved = await savedService.exists(browser_id, wishlist_id);
    if (alreadySaved) {
        throw new AppError(409, "Wishlist già salvata nei preferiti");
    }

    const saved = await savedService.save({ browser_id, wishlist_id });
    res.status(201).json({
        message: "Wishlist salvata nei preferiti",
        saved,
    });
};

/**
 * Removes a wishlist from favorites
 * @route DELETE /api/saved/:browserId/:wishlistId
 * @param req - Express request object with browserId and wishlistId params
 * @param res - Express response object
 * @returns 200 status with success message, or 404 if not found
 */
export const remove = async (req: Request, res: Response) => {
    const { browserId, wishlistId } = req.params;
    const deleted = await savedService.remove(browserId, Number(wishlistId));

    if (!deleted) {
        throw new AppError(404, "Preferito non trovato");
    }

    res.json({ message: "Wishlist rimossa dai preferiti" });
};
