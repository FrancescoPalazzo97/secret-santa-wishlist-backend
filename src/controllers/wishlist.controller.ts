import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import * as wishlistService from "../services/wishlist.service";
import { Certificate } from "node:crypto";

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

export const publish = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const wishlist = await wishlistService.publish(Number(id));

        if (!wishlist) {
            throw new AppError(404, "Wishlist non trovata!");
        }

        if (wishlist.is_published) {
            throw new AppError(403, "Wishlist già pubblicata");
        }

        // Verifica che ci siano i regali
        // TODO: Bisogna aggiungere i gifts services prima
    } catch (error) {
        console.error(error);
        next(error);
    }
};

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

        // TODO: Bisogna aggiungere i gifts services prima
    } catch (error) {
        console.error(error);
        next(error);
    }
};
