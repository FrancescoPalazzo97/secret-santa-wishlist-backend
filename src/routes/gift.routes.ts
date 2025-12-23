import { Router } from "express";
import { validate } from "../middleware/validate";
import * as controller from "../controllers/gift.controller";
import { idParamSchema, updateGiftSchema } from "../schemas";

const router = Router();

// * GET /api/gifts/random - Regalo casuale
router.get("/random", controller.getRandom);

// * PUT /api/gifts/:id - Modifica regalo
router.put(
    "/:id",
    validate(idParamSchema, "params"),
    validate(updateGiftSchema),
    controller.update
);

// * DELETE /api/gifts/:id - Elimina regalo
router.delete(
    "/:id",
    validate(idParamSchema, "params"),
    controller.remove
);

export default router;
