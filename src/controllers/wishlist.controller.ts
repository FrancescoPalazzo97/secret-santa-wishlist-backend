import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as wishlistService from '../services/wishlist.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const wishlist = await wishlistService.create(req.body);
        res.status(201).json(wishlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const wishlist = await wishlistService.getByIdWithGifts(Number(id));

        if (!wishlist) {
            throw new AppError(404, 'Wishlist non trovata!');
        }

        res.json(wishlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const wishlist = await wishlistService.getById(Number(id));

        if (!wishlist) {
            throw new AppError(404, 'Wishlist non trovata!');
        }

        if (wishlist.is_published) {
            throw new AppError(403, 'Impossibile modificare una wishlist pubblicata!');
        }

        const updated = await wishlistService.update(Number(id), req.body);
        res.json(updated);
    } catch (error) {
        console.error(error);
        next(error);
    }
}