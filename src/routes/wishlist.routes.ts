import { Router } from "express";
import { validate } from "../middleware/validate";
import * as controller from "../controllers/wishlist.controller";
import {
    createWishlistSchema,
    updateWishlistSchema,
    idParamSchema,
    createGiftSchema,
} from "../schemas";

const router = Router();

// * POST /api/wishlists - crea wishlist
// ! Ancora da testare
router.post(
    "/",
    validate(createWishlistSchema),
    controller.create
);

// * GET /api/wishlists/:id - Dettaglio wishlist
// ! Ancora da testare
router.get(
    "/:id",
    validate(idParamSchema, "params"),
    controller.getById
);

// * PUT /api/wishlists/:id - Modifica wishlist
// ! Ancora da testare
router.put(
    "/:id",
    validate(idParamSchema, "params"),
    validate(updateWishlistSchema),
    controller.update
);

// * DELETE /api/wishlists/:id - Elimina wishlist
// ! Ancora da testare
router.delete(
    "/:id",
    validate(idParamSchema, "params"),
    controller.remove
);

// * POST /api/wishlists/:id/publish - Pubblica wishlist
// ! Ancora da testare
router.post(
    "/:id/publish",
    validate(idParamSchema, "params"),
    controller.publish
);

// * POST /api/wishlists/:id/gifts - Aggiungi regalo
// ! Ancora da testare
router.post(
    "/:id/gifts",
    validate(idParamSchema, "params"),
    validate(createGiftSchema),
    controller.addGift
);

// * GET /api/wishlists/:id/gifts - Lista regali
router.get(
    "/:id/gifts",
    validate(idParamSchema, "params"),
    controller.getGifts
);

export default router;
