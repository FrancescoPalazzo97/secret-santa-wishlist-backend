import { Router } from "express";
import { validate } from "../middleware/validate";
import * as controller from "../controllers/saved.controller";
import { savedWishlistSchema, savedParamsSchema } from "../schemas";

const router = Router();

// * GET /api/saved/:browserId - Lista wishlist salvate
router.get(
    "/:browserId",
    validate(savedParamsSchema, "params"),
    controller.getByBrowserId
);

// * POST /api/saved - Salva wishlist nei preferiti
router.post(
    "/",
    validate(savedWishlistSchema),
    controller.save
);

// * DELETE /api/saved/:browserId/:wishlistId - Rimuove dai preferiti
router.delete(
    "/:browserId/:wishlistId",
    validate(savedParamsSchema, "params"),
    controller.remove
);

export default router;
