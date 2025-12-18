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

// ! PUT /api/wishlists/:id - Modifica wishlist
router.put(
    "/:id",
    validate(idParamSchema, "params"),
    validate(updateWishlistSchema),
    // TODO: controller.updateWishlist
);

// ! DELETE /api/wishlists/:id - Elimina wishlist
router.delete(
    "/:id",
    validate(idParamSchema, "params"),
    // TODO: controller.deleteWishlist
);

// ! POST /api/wishlists/:id/publish - Pubblica wishlist
router.post(
    "/:id/publish",
    validate(idParamSchema, "params"),
    // TODO: controller.publishWishlist
);

// ! POST /api/wishlists/:id/gifts - Aggiungi regalo
router.post(
    "/:id/gifts",
    validate(idParamSchema, "params"),
    validate(createGiftSchema),
    // TODO: controller.addGiftToWishlist
);

// ! GET /api/wishlists/:id/gifts - Lista regali
router.get(
    "/:id/gifts",
    validate(idParamSchema, "params"),
    // TODO: controller.getGiftsByWishlistId
);

export default router;
