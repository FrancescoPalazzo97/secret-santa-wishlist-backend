import { Router } from "express";
import pool from "../config/database";
import wishlistRoutes from "./wishlist.routes";
import giftRoutes from "./gift.routes";
import publicRoutes from "./public.routes";
import savedRoutes from "./saved.routes";

const router = Router();

router.use("/wishlists", wishlistRoutes);
router.use("/gifts", giftRoutes);
router.use("/public", publicRoutes);
router.use("/saved", savedRoutes);

router.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

router.get("/items", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM wishlists");
        res.json(rows);
    } catch (err) {
        console.error("Error fetching items:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
