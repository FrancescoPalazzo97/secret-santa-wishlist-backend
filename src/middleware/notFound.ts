import { Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
    res.status(404).json({
        error: "404 | Endpoint non trovato!",
    });
}
