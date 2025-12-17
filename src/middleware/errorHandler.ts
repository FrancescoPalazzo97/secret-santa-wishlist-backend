import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public details?: Record<string, string>,
    ) {
        super(message);
        this.name = "AppError";
    }
}

export function errorHandler(
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    console.error("Errore: ", err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.details && { details: err.details }),
        });
    }

    res.status(500).json({
        error: "Errore generico del server!",
    });
}
