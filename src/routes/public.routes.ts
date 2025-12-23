import { Router } from "express";
import { validate } from "../middleware/validate";
import * as controller from "../controllers/public.controller";
import { tokenParamSchema, reserveParamsSchema, reservationSchema } from "../schemas";

const router = Router();

// * GET /api/public/:token - Visualizza wishlist pubblica
router.get(
    "/:token",
    validate(tokenParamSchema, "params"),
    controller.getByToken
);

// * POST /api/public/:token/gifts/:giftId/reserve - Prenota regalo
router.post(
    "/:token/gifts/:giftId/reserve",
    validate(reserveParamsSchema, "params"),
    validate(reservationSchema),
    controller.reserveGift
);

export default router;
